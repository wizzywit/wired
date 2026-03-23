import { KonvaCanvas } from '../components/canvas/KonvaCanvas'
import { AppTopNav } from '../components/layout/AppTopNav'
import { FloatingToolbar } from '../components/layout/FloatingToolbar'
import { Icon } from '../components/ui/Icon'
import { CanvasProvider, useCanvas } from '../context/CanvasContext'

const avatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
]

function CanvasScreenInner() {
  const { undo, redo, canUndo, canRedo } = useCanvas()

  return (
    <div className="h-dvh overflow-hidden bg-background font-body text-on-background">
      <AppTopNav
        breadcrumb="Q4 Strategy Session"
        presence={
          <div className="mr-2 hidden -space-x-2 sm:flex">
            {avatars.map((src, i) => (
              <div
                key={src}
                className="h-8 w-8 overflow-hidden rounded-full border-2 border-white dark:border-slate-800"
                title={['Alex', 'Jordan', 'Maya'][i]}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-surface-container-high text-[10px] font-bold text-on-surface-variant dark:border-slate-800">
              +2
            </div>
          </div>
        }
      />

      <FloatingToolbar variant="canvas" />

      <main className="relative ml-0 mt-14 h-[calc(100dvh-3.5rem)] w-full overflow-hidden md:ml-20">
        <KonvaCanvas />
      </main>

      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-white/85 p-1.5 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
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
  return (
    <CanvasProvider>
      <CanvasScreenInner />
    </CanvasProvider>
  )
}
