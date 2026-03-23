/**
 * Full-screen skeleton + progress bar (Ether loading) — matches dashboard_loading_light reference.
 */
export function LoadingScreen() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface font-body text-on-surface">
      <div className="fixed left-0 top-0 z-[60] h-[2px] w-full bg-surface-container">
        <div className="h-full w-1/3 max-w-[40%] animate-pulse bg-primary" />
      </div>

      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between bg-[#f7f9fb]/80 px-6 backdrop-blur-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] dark:bg-slate-900/80">
        <div className="flex items-center gap-8">
          <span className="font-display text-lg font-extrabold tracking-tighter text-[#191c1e] dark:text-slate-100">
            The Wired Studio
          </span>
          <nav className="hidden space-x-6 md:flex">
            <div className="skeleton-text w-16 opacity-40" />
            <div className="skeleton-text w-20 opacity-40" />
            <div className="skeleton-text w-14 opacity-40" />
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full skeleton-block opacity-40" />
          <div className="h-8 w-8 rounded-full skeleton-block opacity-40" />
          <div className="h-8 w-8 rounded-full skeleton-block" />
        </div>
      </header>

      <aside className="fixed left-0 top-1/2 z-40 m-4 flex h-fit w-20 -translate-y-1/2 flex-col items-center space-y-4 rounded-xl bg-white/80 py-4 shadow-[0_20px_40px_rgba(25,28,30,0.06)] backdrop-blur-xl dark:bg-slate-900/80">
        <div className="flex w-full flex-col items-center space-y-6 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <div className="h-6 w-6 animate-tonal-pulse rounded bg-primary/40" />
          </div>
          <div className="flex w-full flex-col items-center space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-10 animate-tonal-pulse rounded-lg opacity-20 skeleton-block" />
            ))}
          </div>
        </div>
      </aside>

      <main className="min-h-screen pb-12 pl-6 pr-8 pt-24 md:pl-28">
        <section className="mb-12">
          <div className="skeleton-block mb-4 h-10 w-64 rounded-lg" />
          <div className="skeleton-text w-96 opacity-60" />
        </section>

        <div className="mb-12 grid grid-cols-12 gap-6">
          <div className="relative col-span-12 flex h-[400px] flex-col justify-end overflow-hidden rounded-full bg-surface-container-lowest p-8 shadow-[0_20px_40px_rgba(25,28,30,0.06)] md:col-span-8 dark:bg-surface-container">
            <div className="absolute inset-0 skeleton-block opacity-30" />
            <div className="relative z-10 space-y-4">
              <div className="skeleton-block h-8 w-1/3 rounded-lg" />
              <div className="skeleton-text w-2/3" />
            </div>
          </div>
          <div className="col-span-12 grid grid-rows-2 gap-6 md:col-span-4">
            <div className="relative overflow-hidden rounded-full bg-surface-container-lowest p-6 shadow-[0_20px_40px_rgba(25,28,30,0.06)] dark:bg-surface-container">
              <div className="absolute inset-0 skeleton-block opacity-10" />
              <div className="skeleton-block mb-4 h-12 w-12 rounded-lg" />
              <div className="skeleton-text w-24" />
            </div>
            <div className="relative overflow-hidden rounded-full bg-surface-container-lowest p-6 shadow-[0_20px_40px_rgba(25,28,30,0.06)] dark:bg-surface-container">
              <div className="absolute inset-0 skeleton-block opacity-10" />
              <div className="skeleton-block mb-4 h-12 w-12 rounded-lg" />
              <div className="skeleton-text w-24" />
            </div>
          </div>
        </div>

        <section>
          <div className="mb-8 flex items-end justify-between">
            <div className="skeleton-block h-8 w-48 rounded-lg" />
            <div className="skeleton-text w-24" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group space-y-4">
                <div className="aspect-video w-full animate-tonal-pulse rounded-full bg-surface-container-highest" />
                <div className="space-y-2 px-2">
                  <div className="skeleton-text w-3/4" />
                  <div className="skeleton-text w-1/2 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="fixed bottom-8 right-8 flex items-center gap-3 rounded-full bg-surface-container-lowest px-4 py-2 shadow-lg dark:bg-surface-container">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(0,67,200,0.6)]" />
          <span className="font-label text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
            Syncing Workspace
          </span>
        </div>
      </main>

      <div className="pointer-events-none fixed inset-0 -z-10 bg-surface">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-secondary-container/10 blur-[100px]" />
      </div>
    </div>
  )
}
