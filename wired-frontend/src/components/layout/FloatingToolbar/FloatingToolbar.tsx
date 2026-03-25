import type { CanvasTool } from '../../../theme/canvasTypes';
import { STICKY_COLOR_PRESETS } from '../../../theme/canvasTypes';
import { useCanvasStore } from '../../../collaboration-canvas/canvas';
import { Icon } from '../../common/Icon';
import { getShapeButtonPresentation, SHAPE_OPTIONS } from './floatingToolbarLogic';
import { useFloatingFlyoutUseCase } from './useFloatingFlyoutUseCase';

const dashboardTools: { icon: string; label: string; active?: boolean }[] = [
  { icon: 'near_me', label: 'Select', active: true },
  { icon: 'edit', label: 'Pen' },
  { icon: 'pentagon', label: 'Shapes' },
  { icon: 'title', label: 'Text' },
  { icon: 'sticky_note_2', label: 'Sticky' },
  { icon: 'gesture', label: 'Lasso' },
];

type CanvasShapesFlyoutProps = {
  tool: CanvasTool;
  setTool: (t: CanvasTool) => void;
};

function CanvasShapesFlyout({ tool, setTool }: CanvasShapesFlyoutProps) {
  const { menuOpen, wrapRef, clearCloseTimer, scheduleClose, openMenu, closeMenu, toggleMenu } =
    useFloatingFlyoutUseCase();
  const { active: shapeActive, icon: mainIcon, label: mainLabel } = getShapeButtonPresentation(tool);

  return (
    <div
      ref={wrapRef}
      className="relative z-50 flex flex-row items-start gap-1"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
        className={
          shapeActive
            ? 'group flex flex-col items-center gap-1 active:scale-90'
            : 'group flex flex-col items-center gap-1 text-slate-400 transition-all hover:text-blue-500 active:scale-90 dark:text-slate-500 dark:hover:text-blue-300'
        }
      >
        {shapeActive ? (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Icon name={mainIcon} size="sm" />
            </div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-blue-600">{mainLabel}</span>
          </>
        ) : (
          <>
            <Icon name={mainIcon} size="sm" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest">{mainLabel}</span>
          </>
        )}
      </button>

      {menuOpen ? (
        <div
          role="menu"
          aria-label="Shape tools"
          className="absolute left-full top-0 z-50 ml-1 flex min-w-[7.5rem] flex-col gap-0.5 rounded-2xl border border-slate-200/90 bg-white/95 py-1.5 pl-1.5 pr-2 shadow-lg backdrop-blur-xl dark:border-slate-600 dark:bg-slate-900/95"
        >
          {SHAPE_OPTIONS.map((opt) => {
            const selected = tool === opt.tool;
            return (
              <button
                key={opt.tool}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTool(opt.tool);
                  clearCloseTimer();
                  closeMenu();
                }}
                className={
                  selected
                    ? 'flex items-center gap-2 rounded-xl bg-blue-600/10 px-2 py-1.5 text-left text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'
                    : 'flex items-center gap-2 rounded-xl px-2 py-1.5 text-left text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }
              >
                <Icon name={opt.icon} size="sm" className="shrink-0" />
                <span className="font-sans text-[11px] font-bold uppercase tracking-wide">{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type CanvasStickyFlyoutProps = {
  tool: CanvasTool;
  setTool: (t: CanvasTool) => void;
  stickyFill: string;
  setStickyPreset: (fill: string, textColor: string) => void;
};

function CanvasStickyFlyout({ tool, setTool, stickyFill, setStickyPreset }: CanvasStickyFlyoutProps) {
  const { menuOpen, wrapRef, clearCloseTimer, scheduleClose, openMenu, closeMenu, toggleMenu } =
    useFloatingFlyoutUseCase();

  const stickyActive = tool === 'sticky';

  return (
    <div
      ref={wrapRef}
      className="relative z-50 flex flex-row items-start gap-1"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
        className={
          stickyActive
            ? 'group flex flex-col items-center gap-1 active:scale-90'
            : 'group flex flex-col items-center gap-1 text-slate-400 transition-all hover:text-blue-500 active:scale-90 dark:text-slate-500 dark:hover:text-blue-300'
        }
      >
        {stickyActive ? (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Icon name="sticky_note_2" size="sm" />
            </div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-blue-600">Sticky</span>
          </>
        ) : (
          <>
            <Icon name="sticky_note_2" size="sm" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Sticky</span>
          </>
        )}
      </button>

      {menuOpen ? (
        <div
          role="menu"
          aria-label="Sticky colors"
          className="absolute left-full top-0 z-50 ml-1 flex min-w-[8rem] flex-col gap-1 rounded-2xl border border-slate-200/90 bg-white/95 py-1.5 pl-1.5 pr-2 shadow-lg backdrop-blur-xl dark:border-slate-600 dark:bg-slate-900/95"
        >
          {STICKY_COLOR_PRESETS.map((opt) => {
            const selected = tool === 'sticky' && stickyFill === opt.fill;
            return (
              <button
                key={opt.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setStickyPreset(opt.fill, opt.textColor);
                  setTool('sticky');
                  clearCloseTimer();
                  closeMenu();
                }}
                className={
                  selected
                    ? 'flex items-center gap-2 rounded-xl bg-blue-600/10 px-2 py-1.5 text-left text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'
                    : 'flex items-center gap-2 rounded-xl px-2 py-1.5 text-left text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-md border border-slate-300 dark:border-slate-600"
                  style={{ backgroundColor: opt.fill }}
                  title={opt.label}
                />
                <span className="font-sans text-[11px] font-bold uppercase tracking-wide">{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type FloatingToolbarProps = {
  /** Canvas variant shows tool labels and wires drawing tools */
  variant?: 'dashboard' | 'canvas';
  className?: string;
};

function CanvasFloatingToolbar({ className = '' }: { className?: string }) {
  const tool = useCanvasStore((state) => state.tool);
  const setTool = useCanvasStore((state) => state.setTool);
  const stickyColor = useCanvasStore((state) => state.stickyColor);
  const setStickyPreset = useCanvasStore((state) => state.setStickyPreset);
  const canUndo = useCanvasStore((state) => state.history.past.length > 0);
  const canRedo = useCanvasStore((state) => state.history.future.length > 0);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);

  return (
    <aside
      className={`fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-6 rounded-3xl bg-white/85 py-4 shadow-ambient backdrop-blur-xl dark:bg-slate-900/85 md:flex w-[4.5rem] ${className}`}
    >
      <div className="flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => setTool('select')}
          className={
            tool === 'select'
              ? 'group flex flex-col items-center gap-1 active:scale-90'
              : 'group flex flex-col items-center gap-1 text-slate-400 transition-all hover:text-blue-500 active:scale-90 dark:text-slate-500 dark:hover:text-blue-300'
          }
        >
          {tool === 'select' ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                <Icon name="near_me" size="sm" />
              </div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-blue-600">Select</span>
            </>
          ) : (
            <>
              <Icon name="near_me" size="sm" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Select</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTool('pen')}
          className={
            tool === 'pen'
              ? 'group flex flex-col items-center gap-1 active:scale-90'
              : 'group flex flex-col items-center gap-1 text-slate-400 transition-all hover:text-blue-500 active:scale-90 dark:text-slate-500 dark:hover:text-blue-300'
          }
        >
          {tool === 'pen' ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                <Icon name="edit" size="sm" />
              </div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-blue-600">Pen</span>
            </>
          ) : (
            <>
              <Icon name="edit" size="sm" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Pen</span>
            </>
          )}
        </button>

        <CanvasShapesFlyout tool={tool} setTool={setTool} />

        <button
          type="button"
          onClick={() => setTool('text')}
          className={
            tool === 'text'
              ? 'group flex flex-col items-center gap-1 active:scale-90'
              : 'group flex flex-col items-center gap-1 text-slate-400 transition-all hover:text-blue-500 active:scale-90 dark:text-slate-500 dark:hover:text-blue-300'
          }
        >
          {tool === 'text' ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                <Icon name="title" size="sm" />
              </div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-blue-600">Text</span>
            </>
          ) : (
            <>
              <Icon name="title" size="sm" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Text</span>
            </>
          )}
        </button>

        <CanvasStickyFlyout tool={tool} setTool={setTool} stickyFill={stickyColor} setStickyPreset={setStickyPreset} />

        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex cursor-not-allowed flex-col items-center gap-1 text-slate-300 opacity-50 dark:text-slate-600"
        >
          <Icon name="gesture" size="sm" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Lasso</span>
        </button>
      </div>
      <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 dark:border-slate-700">
        <button
          type="button"
          className="text-slate-400 transition-all enabled:hover:text-slate-600 disabled:opacity-30 dark:enabled:hover:text-slate-300"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={() => undo()}
        >
          <Icon name="undo" size="sm" />
        </button>
        <button
          type="button"
          className="text-slate-400 transition-all enabled:hover:text-slate-600 disabled:opacity-30 dark:enabled:hover:text-slate-300"
          aria-label="Redo"
          disabled={!canRedo}
          onClick={() => redo()}
        >
          <Icon name="redo" size="sm" />
        </button>
      </div>
    </aside>
  );
}

export function FloatingToolbar({ variant = 'dashboard', className = '' }: FloatingToolbarProps) {
  if (variant === 'canvas') {
    return <CanvasFloatingToolbar className={className} />;
  }

  return (
    <aside
      className={`fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-6 rounded-3xl bg-white/85 py-4 shadow-ambient backdrop-blur-xl dark:bg-slate-900/85 md:flex w-16 ${className}`}
    >
      <div className="flex flex-col items-center gap-6">
        {dashboardTools.map((t) => (
          <button
            key={t.icon}
            type="button"
            className={
              t.active
                ? 'flex h-10 w-10 scale-110 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:scale-90'
                : 'flex h-10 w-10 items-center justify-center text-slate-400 transition-all hover:-translate-y-0.5 hover:text-blue-500 active:scale-90 dark:text-slate-500 dark:hover:text-blue-300'
            }
          >
            <Icon name={t.icon} size="sm" />
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 dark:border-slate-700">
        <button
          type="button"
          className="text-slate-400 transition-all hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Undo"
        >
          <Icon name="undo" size="sm" />
        </button>
        <button
          type="button"
          className="text-slate-400 transition-all hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Redo"
        >
          <Icon name="redo" size="sm" />
        </button>
      </div>
    </aside>
  );
}
