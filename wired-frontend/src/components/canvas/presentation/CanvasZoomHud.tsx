import { Icon } from '../../common/Icon'

type CanvasZoomHudProps = {
  zoomPercent: number
  onZoomOut: () => void
  onZoomIn: () => void
  onResetView: () => void
}

export function CanvasZoomHud({
  zoomPercent,
  onZoomOut,
  onZoomIn,
  onResetView,
}: CanvasZoomHudProps) {
  return (
    <div className="pointer-events-auto absolute bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl bg-white/85 p-1.5 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
      <div className="flex items-center">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Zoom out"
          onClick={onZoomOut}
        >
          <Icon name="remove" size="sm" />
        </button>
        <span className="min-w-[50px] px-2 text-center text-sm font-bold text-on-surface-variant">
          {zoomPercent}%
        </span>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Zoom in"
          onClick={onZoomIn}
        >
          <Icon name="add" size="sm" />
        </button>
      </div>
      <div className="h-6 w-px bg-slate-200 dark:bg-slate-600" />
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Reset zoom and center on canvas origin"
        title="Reset view (100% zoom, origin centered)"
        onClick={onResetView}
      >
        <Icon name="center_focus_weak" size="sm" />
      </button>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Pan hints"
        title="Pan: Space + drag, middle mouse, or drag empty canvas"
      >
        <Icon name="pan_tool" size="sm" />
      </button>
    </div>
  )
}
