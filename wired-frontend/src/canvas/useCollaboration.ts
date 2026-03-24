import * as Y from 'yjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { DrawShape } from '../theme/canvasTypes'
import { getSocket, useMeQuery } from '../service'
import type { RemotePeerAwareness } from './awarenessTypes'
import {
  ORIGIN_LOCAL,
  base64ToUint8,
  getShapesRoot,
  syncShapesToYMap,
  uint8ToBase64,
  yMapToShapes,
} from './yjsShapeMap'

const CURSOR_EMIT_MS = 45

function mergePeer(
  old: RemotePeerAwareness | undefined,
  payload: {
    user: RemotePeerAwareness['user']
    at: number
    cursor?: { wx: number; wy: number; tool?: string } | null
    selectedId?: string | null
    tool?: string
  },
): RemotePeerAwareness {
  const cursor =
    'cursor' in payload
      ? payload.cursor === null || payload.cursor === undefined
        ? undefined
        : payload.cursor
      : old?.cursor
  return {
    user: payload.user,
    cursor,
    selectedId:
      'selectedId' in payload ? payload.selectedId : old?.selectedId,
    tool: 'tool' in payload ? payload.tool : old?.tool,
    at: payload.at,
  }
}

export function useCollaboration(
  documentId: string,
  shapes: DrawShape[],
  replaceShapes: (shapes: DrawShape[]) => void,
) {
  const navigate = useNavigate()
  const location = useLocation()
  const roomId = documentId.trim()
  const [usersOnline, setUsersOnline] = useState(1)
  const [isSynced, setIsSynced] = useState(false)
  const [remotePeers, setRemotePeers] = useState<RemotePeerAwareness[]>([])
  const syncReadyRef = useRef(false)
  const ydocRef = useRef<Y.Doc | null>(null)
  const ymapRef = useRef<ReturnType<typeof getShapesRoot> | null>(null)
  const lastCursorEmitRef = useRef(0)
  const meUserIdRef = useRef<string | undefined>(undefined)
  const meQuery = useMeQuery()
  meUserIdRef.current = meQuery.data?.user?.id

  useEffect(() => {
    if (!roomId) return
    if (meQuery.isPending) return
    if (meQuery.isError || !meQuery.data?.user) {
      const next = encodeURIComponent(
        `${location.pathname}${location.search}`,
      )
      navigate(`/login?next=${next}`)
      return
    }

    let mounted = true
    const socket = getSocket()

    const ydoc = new Y.Doc()
    const ymap = getShapesRoot(ydoc)
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

    const onRoomUserLeft = (payload: {
      usersOnline: number
      user?: { id: string }
    }) => {
      setUsersOnline(payload.usersOnline || 1)
      const leftId = payload.user?.id
      if (leftId) {
        setRemotePeers((prev) => prev.filter((p) => p.user.id !== leftId))
      }
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
      const next = encodeURIComponent(
        `${location.pathname}${location.search}`,
      )
      navigate(`/login?next=${next}`)
    }

    const onRoomError = (payload: { roomId: string }) => {
      if (payload.roomId !== roomId || !mounted) return
      navigate('/dashboard', { replace: true })
    }

    const onAwarenessPeer = (payload: {
      user: RemotePeerAwareness['user']
      at: number
      cursor?: { wx: number; wy: number; tool?: string } | null
      selectedId?: string | null
      tool?: string
    }) => {
      if (!mounted) return
      if (payload.user.id === meUserIdRef.current) return
      setRemotePeers((prev) => {
        const map = new Map(prev.map((p) => [p.user.id, p]))
        const old = map.get(payload.user.id)
        map.set(payload.user.id, mergePeer(old, payload))
        return [...map.values()].sort((a, b) =>
          a.user.id.localeCompare(b.user.id),
        )
      })
    }

    const onAwarenessLeft = (payload: { userId: string }) => {
      if (!mounted) return
      setRemotePeers((prev) => prev.filter((p) => p.user.id !== payload.userId))
    }

    socket.on('room:joined', onRoomJoined)
    socket.on('room:user-joined', onRoomUserJoined)
    socket.on('room:user-left', onRoomUserLeft)
    socket.on('yjs:sync', onYjsSync)
    socket.on('yjs:update', onYjsUpdate)
    socket.on('auth:error', onAuthError)
    socket.on('awareness:peer', onAwarenessPeer)
    socket.on('awareness:left', onAwarenessLeft)
    socket.on('room:error', onRoomError)

    socket.emit('room:join', { roomId })

    return () => {
      mounted = false
      syncReadyRef.current = false
      setIsSynced(false)
      setRemotePeers([])
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
      socket.off('awareness:peer', onAwarenessPeer)
      socket.off('awareness:left', onAwarenessLeft)
      socket.off('room:error', onRoomError)
    }
  }, [
    location.pathname,
    location.search,
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

  const emitAwarenessPatch = useCallback(
    (patch: {
      cursor?: { wx: number; wy: number; tool?: string } | null
      selectedId?: string | null
      tool?: string
    }) => {
      getSocket().emit('awareness:update', { roomId, ...patch })
    },
    [roomId],
  )

  const emitCursorWorld = useCallback(
    (wx: number, wy: number, tool: string) => {
      const now = Date.now()
      if (now - lastCursorEmitRef.current < CURSOR_EMIT_MS) return
      lastCursorEmitRef.current = now
      emitAwarenessPatch({ cursor: { wx, wy, tool } })
    },
    [emitAwarenessPatch],
  )

  const clearCursor = useCallback(() => {
    emitAwarenessPatch({ cursor: null })
  }, [emitAwarenessPatch])

  const emitSelectionTool = useCallback(
    (selectedId: string | null, tool: string) => {
      emitAwarenessPatch({ selectedId, tool })
    },
    [emitAwarenessPatch],
  )

  return {
    roomId,
    usersOnline,
    isSynced,
    localUserId: meQuery.data?.user?.id ?? '',
    remotePeers,
    emitCursorWorld,
    clearCursor,
    emitSelectionTool,
  }
}
