import { Icon } from '../components/common/Icon'

/**
 * Dark “syncing canvas” reference — uses inverse surfaces; works best with dark theme toggled on.
 */
export function CanvasSyncingScreen() {
  return (
    <div className="min-h-dvh overflow-hidden bg-inverse-surface font-body text-inverse-on-surface selection:bg-primary-container selection:text-white">
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between bg-[#191c1e]/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-extrabold tracking-tighter text-[#f2f4f6]">
            The Wired Studio
          </span>
          <div className="flex items-center gap-2 rounded-full bg-surface-container-highest/10 px-3 py-1">
            <div className="h-2 w-2 animate-breathing rounded-full bg-primary-fixed-dim" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed-dim">
              Saving...
            </span>
          </div>
        </div>
        <nav className="hidden items-center space-x-8 md:flex">
          <a className="border-b-2 border-[#0057FF] font-display text-sm font-bold tracking-tight text-[#b6c4ff]" href="#">
            Select
          </a>
          <a
            className="rounded px-2 py-1 font-display text-sm font-medium text-[#c3c5d9] transition-colors duration-300 hover:bg-[#2d2f31]"
            href="#"
          >
            History
          </a>
          <a
            className="rounded px-2 py-1 font-display text-sm font-medium text-[#c3c5d9] transition-colors duration-300 hover:bg-[#2d2f31]"
            href="#"
          >
            Settings
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <button type="button" className="rounded-full p-2 text-[#c3c5d9] transition-colors hover:bg-[#2d2f31]">
            <Icon name="history" />
          </button>
          <button type="button" className="rounded-full p-2 text-[#c3c5d9] transition-colors hover:bg-[#2d2f31]">
            <Icon name="settings" />
          </button>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-surface-container-highest">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=sync"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-1/2 z-40 m-4 flex h-fit w-20 -translate-y-1/2 flex-col items-center space-y-4 rounded-xl bg-[#191c1e]/80 py-4 shadow-[0_20px_40px_rgba(25,28,30,0.06)] backdrop-blur-xl">
        <span className="text-[10px] font-bold uppercase tracking-widest text-outline-variant">
          Toolbar
        </span>
        <button
          type="button"
          className="group relative rounded-lg bg-[#0057FF] p-3 text-white shadow-lg shadow-[#0057FF]/20 transition-all active:scale-90"
        >
          <Icon name="near_me" />
        </button>
        {['edit', 'pentagon', 'title', 'image'].map((name) => (
          <button
            key={name}
            type="button"
            className="p-3 text-[#c3c5d9] transition-transform duration-300 hover:scale-110 hover:text-[#0057FF] active:scale-90"
          >
            <Icon name={name} />
          </button>
        ))}
        <button
          type="button"
          className="mt-2 border-t border-surface-container-highest/10 p-3 pt-4 text-[#c3c5d9] transition-transform hover:scale-110 hover:text-[#0057FF]"
        >
          <Icon name="ink_eraser" />
        </button>
      </aside>

      <main className="skeleton-dot-grid relative flex h-screen w-full items-center justify-center pt-16">
        <div className="relative flex h-[716px] w-full max-w-6xl flex-wrap items-center justify-center gap-12 p-12">
          <div className="absolute left-1/2 top-1/4 flex -translate-x-1/2 flex-col items-center gap-4">
            <div className="flex h-32 w-64 animate-tonal-pulse items-center justify-center rounded-xl border border-white/5 bg-surface-container-highest/20 backdrop-blur-sm">
              <div className="h-4 w-3/4 rounded-full bg-surface-container-highest/40" />
            </div>
            <div className="h-24 w-[2px] bg-gradient-to-b from-surface-container-highest/40 to-transparent animate-tonal-pulse" />
          </div>
          <div className="mt-32 grid w-full grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex translate-y-12 flex-col items-start gap-6">
              <div className="flex h-48 w-full animate-tonal-pulse flex-col gap-4 rounded-xl bg-surface-container-highest/10 p-6">
                <div className="h-4 w-1/2 rounded-full bg-surface-container-highest/30" />
                <div className="h-2 w-full rounded-full bg-surface-container-highest/20" />
                <div className="h-2 w-2/3 rounded-full bg-surface-container-highest/20" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-64 w-full animate-tonal-pulse flex-col gap-6 rounded-xl bg-surface-container-highest/15 p-8 shadow-2xl shadow-black/20">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-surface-container-highest/30" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/4 rounded-full bg-surface-container-highest/30" />
                    <div className="h-3 w-1/2 rounded-full bg-surface-container-highest/20" />
                  </div>
                </div>
                <div className="aspect-video w-full rounded-lg bg-surface-container-highest/10" />
              </div>
            </div>
            <div className="-translate-y-8 flex flex-col items-end gap-6">
              <div className="flex h-40 w-full animate-tonal-pulse flex-col gap-4 rounded-xl bg-surface-container-highest/10 p-6">
                <div className="h-4 w-2/3 rounded-full bg-surface-container-highest/30" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-lg bg-surface-container-highest/20" />
                  <div className="h-8 w-8 rounded-lg bg-surface-container-highest/20" />
                  <div className="h-8 w-8 rounded-lg bg-surface-container-highest/20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-8 right-8 z-40 flex gap-4 rounded-full border border-white/5 bg-[#191c1e]/60 p-2 backdrop-blur-md">
          <div className="h-10 w-10 animate-tonal-pulse rounded-full bg-surface-container-highest/20" />
          <div className="h-10 w-24 animate-tonal-pulse rounded-full bg-surface-container-highest/20" />
          <div className="h-10 w-10 animate-tonal-pulse rounded-full bg-surface-container-highest/20" />
        </div>
      </main>

      <div className="fixed left-0 top-0 z-[60] h-[2px] w-[30%] bg-primary" />
    </div>
  )
}
