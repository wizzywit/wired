import { AppTopNav } from '../components/layout/AppTopNav/AppTopNav';
import { Icon } from '../components/common/Icon';

export function ExportSettingsScreen() {
  return (
    <div className="overflow-hidden bg-surface font-body text-on-surface antialiased">
      <AppTopNav />

      <main className="pointer-events-none fixed inset-0 flex items-center justify-center pt-14">
        <div className="h-full w-full bg-[radial-gradient(#e1e3e4_1px,transparent_1px)] [background-size:32px_32px] dark:bg-[radial-gradient(rgba(148,163,184,0.2)_1px,transparent_1px)]" />
        <div className="pointer-events-auto absolute left-1/3 top-1/4 flex w-96 flex-col rounded-xl border border-outline-variant/10 bg-surface-container-low p-6 shadow-sm">
          <div className="mb-4 h-4 w-24 rounded bg-surface-container-highest" />
          <div className="mb-2 h-2 w-full rounded bg-surface-container-highest" />
          <div className="mb-8 h-2 w-3/4 rounded bg-surface-container-highest" />
          <div className="mt-auto flex gap-2">
            <div className="h-8 w-8 rounded-full bg-secondary-container" />
            <div className="h-8 w-8 rounded-full bg-tertiary-container" />
          </div>
        </div>
      </main>

      <div className="fixed inset-0 z-[60] flex justify-end p-6 pointer-events-none">
        <div className="pointer-events-auto flex h-full w-full max-w-md flex-col gap-4">
          <section className="glass-panel flex flex-1 flex-col overflow-hidden rounded-xl border border-white/20 shadow-[0_24px_48px_rgba(0,0,0,0.08)] dark:border-white/10">
            <div className="border-b border-outline-variant/10 px-8 py-6">
              <h2 className="text-2xl font-bold tracking-tight">Export Workspace</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Prepare your canvas for presentation or production.
              </p>
            </div>
            <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto px-8 py-6">
              <div>
                <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-primary bg-primary/5 p-4 text-primary transition-all"
                  >
                    <Icon name="image" />
                    <span className="text-xs font-semibold">PNG</span>
                    <span className="text-[9px] opacity-70">High Res</span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-col items-center gap-2 rounded-xl bg-surface-container-low p-4 text-on-surface-variant transition-all hover:bg-surface-container-high"
                  >
                    <Icon name="picture_as_pdf" />
                    <span className="text-xs font-semibold">PDF</span>
                    <span className="text-[9px] opacity-70">Vector</span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-col items-center gap-2 rounded-xl bg-surface-container-low p-4 text-on-surface-variant transition-all hover:bg-surface-container-high"
                  >
                    <Icon name="code" />
                    <span className="text-xs font-semibold">SVG</span>
                    <span className="text-[9px] opacity-70">Editable</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Export Area
                </label>
                <div className="space-y-2">
                  {[
                    ['indeterminate_question_box', 'Entire Canvas', true],
                    ['aspect_ratio', 'Current View', false],
                    ['frame_inspect', 'Selected Frames', false],
                  ].map(([icon, label, selected]) => (
                    <button
                      key={String(label)}
                      type="button"
                      className="group flex w-full items-center justify-between rounded-xl bg-surface-container-low p-4 transition-all hover:bg-surface-container-high"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name={String(icon)} className="text-on-surface-variant" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <Icon
                        name={selected ? 'check_circle' : 'circle'}
                        className="text-outline-variant group-hover:text-primary"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Resolution Scale
                  </label>
                  <span className="text-xs font-bold text-primary">2.0x (300 DPI)</span>
                </div>
                <input
                  className="h-1 w-full cursor-pointer rounded-lg bg-surface-container-highest accent-primary"
                  type="range"
                  min={1}
                  max={4}
                  step={0.5}
                  defaultValue={2}
                />
                <div className="mt-2 flex justify-between text-[9px] font-medium uppercase text-outline">
                  <span>Standard</span>
                  <span>High Res</span>
                  <span>Ultra</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low/50 p-8 dark:bg-surface-container/40">
              <button
                type="button"
                className="action-gradient flex h-14 w-full items-center justify-center gap-2 rounded-xl font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-[0.98]"
              >
                <Icon name="download" />
                Export to Disk
              </button>
            </div>
          </section>

          <section className="glass-panel rounded-xl border border-white/20 p-6 shadow-nav dark:border-white/10">
            <h3 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Canvas Settings
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="grid_4x4" className="text-xl text-on-surface-variant" />
                  <span className="text-sm font-medium">Snap to Grid</span>
                </div>
                <button
                  type="button"
                  className="relative h-6 w-10 rounded-full bg-primary transition-colors"
                  aria-pressed="true"
                >
                  <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="ads_click" className="text-xl text-on-surface-variant" />
                  <span className="text-sm font-medium">Show Cursors</span>
                </div>
                <button type="button" className="relative h-6 w-10 rounded-full bg-surface-container-highest">
                  <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="palette" className="text-xl text-on-surface-variant" />
                  <span className="text-sm font-medium">Background</span>
                </div>
                <div className="flex gap-1.5 rounded-lg bg-surface-container-high p-1">
                  <div className="h-6 w-6 cursor-pointer rounded border border-outline-variant/10 bg-white shadow-sm" />
                  <div className="h-6 w-6 cursor-pointer rounded bg-surface-container-highest" />
                  <div className="h-6 w-6 cursor-pointer rounded bg-on-background" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="pointer-events-none fixed left-1/3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 opacity-80">
        <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.65376 12.3822L2.10313 1.95679C1.86248 1.25042 2.58025 0.606708 3.25066 0.903823L13.1416 5.28695C13.8409 5.59688 13.8436 6.58849 13.146 6.90169L9.44521 8.56303C9.25593 8.64801 9.10261 8.79978 9.01579 8.98822L7.33088 12.6453C7.01258 13.3362 6.01235 13.3323 5.69894 12.6397L5.65376 12.3822Z"
            fill="#0049db"
          />
        </svg>
        <span className="rounded bg-primary px-2 py-1 text-[10px] font-bold text-white shadow-lg">Alexander V.</span>
      </div>
    </div>
  );
}
