import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { DrawShape } from '../context/canvasTypes'
import { getSocket, useMeQuery } from '../service'
import { diffShapesToPatch, type CanvasPatchOp } from './canvasPatch'

type RoomJoinedPayload = {
  usersOnline: number
  state?: { snapshot?: { objects?: DrawShape[] } }
}

type CanvasStatePayload = {
  state?: { snapshot?: { objects?: DrawShape[] } }
}

export function useCollaboration(
  shapes: DrawShape[],
  replaceShapes: (shapes: DrawShape[]) => void,
  applyRemotePatch: (operations: CanvasPatchOp[]) => void,
) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roomId = useMemo(
    () => searchParams.get('room')?.trim() || 'default-room',
    [searchParams],
  )
  const [usersOnline, setUsersOnline] = useState(1)
  const [isSynced, setIsSynced] = useState(false)
  const syncReadyRef = useRef(false)
  const skipNextBroadcastRef = useRef(false)
  const previousShapesRef = useRef<DrawShape[]>(shapes)
  const meQuery = useMeQuery()

  useEffect(() => {
    if (meQuery.isPending) return
    if (meQuery.isError || !meQuery.data?.user) {
      navigate('/login')
      return
    }

    let mounted = true
    const socket = getSocket()

    const onRoomJoined = (payload: RoomJoinedPayload) => {
      setUsersOnline(payload.usersOnline || 1)
      const incoming = payload.state?.snapshot?.objects
      if (Array.isArray(incoming)) {
        skipNextBroadcastRef.current = true
        previousShapesRef.current = incoming
        replaceShapes(incoming)
      }
      syncReadyRef.current = true
      setIsSynced(true)
    }

    const onRoomUserJoined = (payload: { usersOnline: number }) => {
      setUsersOnline(payload.usersOnline || 1)
    }

    const onRoomUserLeft = (payload: { usersOnline: number }) => {
      setUsersOnline(payload.usersOnline || 1)
    }

    const onCanvasState = (payload: CanvasStatePayload) => {
      const incoming = payload.state?.snapshot?.objects
      if (!Array.isArray(incoming)) return
      skipNextBroadcastRef.current = true
      previousShapesRef.current = incoming
      replaceShapes(incoming)
    }

    const onCanvasPatch = (payload: { operations?: CanvasPatchOp[] }) => {
      const operations = payload.operations
      if (!Array.isArray(operations) || operations.length === 0) return
      skipNextBroadcastRef.current = true
      applyRemotePatch(operations)
    }

    const onAuthError = () => {
      navigate('/login')
    }

    function startSession() {
      if (!mounted) return

      socket.on('room:joined', onRoomJoined)
      socket.on('room:user-joined', onRoomUserJoined)
      socket.on('room:user-left', onRoomUserLeft)
      socket.on('canvas:state', onCanvasState)
      socket.on('canvas:patch', onCanvasPatch)
      socket.on('auth:error', onAuthError)

      socket.emit('room:join', { roomId })
      socket.emit('canvas:request-state', { roomId })
    }

    startSession()

    return () => {
      mounted = false
      syncReadyRef.current = false
      setIsSynced(false)
      socket.emit('room:leave', { roomId })
      socket.off('room:joined', onRoomJoined)
      socket.off('room:user-joined', onRoomUserJoined)
      socket.off('room:user-left', onRoomUserLeft)
      socket.off('canvas:state', onCanvasState)
      socket.off('canvas:patch', onCanvasPatch)
      socket.off('auth:error', onAuthError)
    }
  }, [
    meQuery.data?.user,
    meQuery.isError,
    meQuery.isPending,
    navigate,
    replaceShapes,
    applyRemotePatch,
    roomId,
  ])

  useEffect(() => {
    if (!syncReadyRef.current) return
    if (skipNextBroadcastRef.current) {
      skipNextBroadcastRef.current = false
      previousShapesRef.current = shapes
      return
    }

    const operations = diffShapesToPatch(previousShapesRef.current, shapes)
    previousShapesRef.current = shapes
    if (operations.length === 0) return

    getSocket().emit('canvas:patch', {
      roomId,
      operations,
    })
  }, [roomId, shapes])

  return { roomId, usersOnline, isSynced }
}
