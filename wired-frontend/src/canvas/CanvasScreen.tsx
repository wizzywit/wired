import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  type CSSProperties,
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppTopNav } from '../components/layout/AppTopNav'
import { FloatingToolbar } from '../components/layout/FloatingToolbar'
import { Icon } from '../components/common/Icon'
import { KonvaCanvas, useCanvasStore } from '../components/canvas'
import {
  useDocumentQuery,
  useMeQuery,
  useUpdateDocumentMutation,
} from '../service'
import type { AwarenessUser } from './awarenessTypes'
import {
  colorForUserId,
  initialsFromAwarenessUser,
} from './collaborationUserChrome'
import { useCollaboration } from './useCollaboration'

const PRESENCE_FACE_MAX = 3

function presenceGlowStyle(accent: string): CSSProperties {
  return {
    backgroundColor: accent,
    boxShadow: `0 0 0 1px rgba(255,255,255,0.9), 0 0 4px 0 ${accent}`,
  }
}

function CanvasGate() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const documentId = searchParams.get('document')?.trim() ?? ''
  const meQuery = useMeQuery()
  const docQuery = useDocumentQuery(
    documentId,
    Boolean(documentId) && meQuery.isSuccess,
  )

  useEffect(() => {
    if (!documentId) {
      navigate('/dashboard', { replace: true })
    }
  }, [documentId, navigate])

  useEffect(() => {
    if (meQuery.isPending) return
    if (meQuery.isError || !meQuery.data?.user) {
      const next = encodeURIComponent(
        `/canvas?document=${encodeURIComponent(documentId)}`,
      )
      navigate(`/login?next=${next}`, { replace: true })
    }
  }, [
    meQuery.isPending,
    meQuery.isError,
    meQuery.data?.user,
    navigate,
    documentId,
  ])

  useEffect(() => {
    if (!docQuery.isError) return
    navigate('/dashboard', { replace: true })
  }, [docQuery.isError, navigate])

  if (!documentId) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background font-body text-on-background">
        <p className="text-sm text-on-surface-variant">Redirecting…</p>
      </div>
    )
  }

  if (
    meQuery.isPending ||
    meQuery.isError ||
    !meQuery.data?.user ||
    docQuery.isPending
  ) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background font-body text-on-background">
        <p className="text-sm text-on-surface-variant">Loading document…</p>
      </div>
    )
  }

  if (docQuery.isError || !docQuery.data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background font-body text-on-background">
        <p className="text-sm text-on-surface-variant">Redirecting…</p>
      </div>
    )
  }

  return (
    <CanvasScreenInner
      documentId={documentId}
      documentTitle={docQuery.data.title}
      documentOwnerId={docQuery.data.ownerId}
    />
  )
}

function CanvasScreenInner({
  documentId,
  documentTitle,
  documentOwnerId,
}: {
  documentId: string
  documentTitle: string
  documentOwnerId: string
}) {
  const replaceShapes = useCanvasStore((state) => state.replaceShapes)
  const undo = useCanvasStore((state) => state.undo)
  const redo = useCanvasStore((state) => state.redo)
  const canUndo = useCanvasStore((state) => state.history.past.length > 0)
  const canRedo = useCanvasStore((state) => state.history.future.length > 0)
  const shapes = useCanvasStore((state) => state.history.present)
  const tool = useCanvasStore((state) => state.tool)
  const selectedId = useCanvasStore((state) => state.selectedId)
  const meQuery = useMeQuery()
  const {
    usersOnline,
    isSynced,
    localUserId,
    remotePeers,
    emitCursorWorld,
    clearCursor,
    emitSelectionTool,
  } = useCollaboration(documentId, shapes, replaceShapes)

  const presenceUsers = useMemo((): AwarenessUser[] => {
    const me = meQuery.data?.user
    if (!me?.id) return []
    const byId = new Map<string, AwarenessUser>()
    byId.set(me.id, {
      id: me.id,
      email: me.email,
      displayName: me.displayName,
    })
    for (const p of remotePeers) {
      if (!byId.has(p.user.id)) {
        byId.set(p.user.id, p.user)
      }
    }
    return [...byId.values()].sort((a, b) => {
      if (a.id === localUserId) return -1
      if (b.id === localUserId) return 1
      return a.displayName.localeCompare(b.displayName, undefined, {
        sensitivity: 'base',
      })
    })
  }, [localUserId, meQuery.data?.user, remotePeers])

  const presenceFaceUsers = useMemo(
    () => presenceUsers.slice(0, PRESENCE_FACE_MAX),
    [presenceUsers],
  )

  const presenceOverflow = Math.max(0, usersOnline - presenceFaceUsers.length)

  const updateDocument = useUpdateDocumentMutation()
  const handleRenameBreadcrumb = useCallback(
    async (title: string) => {
      await updateDocument.mutateAsync({ documentId, title })
    },
    [documentId, updateDocument],
  )

  useLayoutEffect(() => {
    replaceShapes([])
  }, [documentId, replaceShapes])

  useEffect(() => {
    if (!isSynced) return
    emitSelectionTool(selectedId ?? null, tool)
  }, [emitSelectionTool, isSynced, selectedId, tool])

  const onPointerWorldMove = useCallback(
    (pt: { x: number; y: number }) => {
      if (!isSynced) return
      emitCursorWorld(pt.x, pt.y, tool)
    },
    [emitCursorWorld, isSynced, tool],
  )

  const collaboration = useMemo(
    () => ({
      remotePeers,
      localUserId,
      onPointerWorldMove,
      onStageMouseLeaveExtra: clearCursor,
    }),
    [clearCursor, localUserId, onPointerWorldMove, remotePeers],
  )

  return (
    <div className="h-dvh overflow-hidden bg-background font-body text-on-background">
      <AppTopNav
        breadcrumb={documentTitle}
        onRenameBreadcrumb={
          localUserId === documentOwnerId ? handleRenameBreadcrumb : undefined
        }
        presence={
          <div
            className="mr-2 hidden items-center sm:flex"
            title={
              isSynced
                ? `${usersOnline} online`
                : 'Connecting…'
            }
          >
            <div className="-space-x-2 flex">
              {presenceFaceUsers.map((u) => {
                const accent = colorForUserId(u.id)
                return (
                  <div
                    key={u.id}
                    className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold leading-none tracking-tight text-white dark:border-slate-800"
                    style={presenceGlowStyle(accent)}
                    title={u.displayName?.trim() || u.email}
                  >
                    {initialsFromAwarenessUser(u)}
                  </div>
                )
              })}
              {presenceOverflow > 0 ? (
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-surface-container-high text-[10px] font-bold text-on-surface-variant shadow-[0_0_0_1px_rgba(255,255,255,0.85),0_1px_3px_rgba(0,0,0,0.08)] dark:border-slate-800">
                  +{presenceOverflow}
                </div>
              ) : null}
            </div>
          </div>
        }
      />

      <FloatingToolbar variant="canvas" />

      <main className="relative ml-0 mt-14 h-[calc(100dvh-3.5rem)] w-full overflow-hidden md:ml-20">
        <KonvaCanvas collaboration={collaboration} />
      </main>

      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-white/85 p-1.5 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
        <div className="px-2 text-[9px] font-bold uppercase tracking-tighter text-slate-500">
          {isSynced ? `${usersOnline} online` : 'syncing...'}
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-600" />
        <button
          type="button"
          className="flex flex-col items-center text-slate-400 enabled:hover:text-blue-500 disabled:opacity-30"
          disabled={!canUndo}
          onClick={() => undo()}
        >
          <Icon name="undo" size="sm" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Undo</span>
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-600" />
        <button
          type="button"
          className="flex flex-col items-center text-slate-400 enabled:hover:text-blue-500 disabled:opacity-30"
          disabled={!canRedo}
          onClick={() => redo()}
        >
          <Icon name="redo" size="sm" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Redo</span>
        </button>
      </div>
    </div>
  )
}

export function CanvasScreen() {
  return <CanvasGate />
}
