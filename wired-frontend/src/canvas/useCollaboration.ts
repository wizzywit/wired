import * as Y from 'yjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { DrawShape } from '../context/canvasTypes'
import { getSocket, useMeQuery } from '../service'
import {
  ORIGIN_LOCAL,
  SHAPES_MAP_NAME,
  base64ToUint8,
  syncShapesToYMap,
  uint8ToBase64,
  yMapToShapes,
} from './yjsShapeMap'

export function useCollaboration(
  shapes: DrawShape[],
  replaceShapes: (shapes: DrawShape[]) => void,
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
  const ydocRef = useRef<Y.Doc | null>(null)
  const ymapRef = useRef<Y.Map<string> | null>(null)
  const meQuery = useMeQuery()

  useEffect(() => {
    if (meQuery.isPending) return
    if (meQuery.isError || !meQuery.data?.user) {
      navigate('/login')
      return
    }

    let mounted = true
    const socket = getSocket()

    const ydoc = new Y.Doc()
    const ymap = ydoc.getMap<string>(SHAPES_MAP_NAME)
    ydocRef.current = ydoc
    ymapRef.current = ymap

    const onUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === ORIGIN_LOCAL) {
        socket.emit('yjs:update', {
          roomId,
          update: uint8ToBase64(update),
        })
        return
      }
      replaceShapes(yMapToShapes(ymap))
    }
    ydoc.on('update', onUpdate)

    const onRoomJoined = (payload: { usersOnline: number }) => {
      setUsersOnline(payload.usersOnline || 1)
    }

    const onRoomUserJoined = (payload: { usersOnline: number }) => {
      setUsersOnline(payload.usersOnline || 1)
    }

    const onRoomUserLeft = (payload: { usersOnline: number }) => {
      setUsersOnline(payload.usersOnline || 1)
    }

    const onYjsSync = (payload: { roomId: string; update: string }) => {
      if (payload.roomId !== roomId || !mounted) return
      Y.applyUpdate(ydoc, base64ToUint8(payload.update), 'socket-sync')
      syncReadyRef.current = true
      setIsSynced(true)
    }

    const onYjsUpdate = (payload: { roomId: string; update: string }) => {
      if (payload.roomId !== roomId || !mounted) return
      Y.applyUpdate(ydoc, base64ToUint8(payload.update), 'socket-remote')
    }

    const onAuthError = () => {
      navigate('/login')
    }

    socket.on('room:joined', onRoomJoined)
    socket.on('room:user-joined', onRoomUserJoined)
    socket.on('room:user-left', onRoomUserLeft)
    socket.on('yjs:sync', onYjsSync)
    socket.on('yjs:update', onYjsUpdate)
    socket.on('auth:error', onAuthError)

    socket.emit('room:join', { roomId })

    return () => {
      mounted = false
      syncReadyRef.current = false
      setIsSynced(false)
      ydoc.off('update', onUpdate)
      ydoc.destroy()
      ydocRef.current = null
      ymapRef.current = null
      socket.emit('room:leave', { roomId })
      socket.off('room:joined', onRoomJoined)
      socket.off('room:user-joined', onRoomUserJoined)
      socket.off('room:user-left', onRoomUserLeft)
      socket.off('yjs:sync', onYjsSync)
      socket.off('yjs:update', onYjsUpdate)
      socket.off('auth:error', onAuthError)
    }
  }, [
    meQuery.data?.user,
    meQuery.isError,
    meQuery.isPending,
    navigate,
    replaceShapes,
    roomId,
  ])

  useEffect(() => {
    const ydoc = ydocRef.current
    const ymap = ymapRef.current
    if (!syncReadyRef.current || !ydoc || !ymap) return

    ydoc.transact(() => {
      syncShapesToYMap(ymap, shapes)
    }, ORIGIN_LOCAL)
  }, [shapes, roomId])

  return { roomId, usersOnline, isSynced }
}
