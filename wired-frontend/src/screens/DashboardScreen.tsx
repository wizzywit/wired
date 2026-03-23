import { AppTopNav } from '../components/layout/AppTopNav'
import { FloatingToolbar } from '../components/layout/FloatingToolbar'
import { MobileBottomNav } from '../components/layout/MobileBottomNav'
import { Icon } from '../components/ui/Icon'
import { SearchField } from '../components/ui/SearchField'

const recent = [
  { title: 'Q4 Strategy Roadmap', when: 'Edited 2h ago' },
  { title: 'User Experience Audit', when: 'Edited yesterday' },
  { title: 'Client Onboarding Flow', when: 'Edited Oct 24' },
  { title: 'Brainstorming Session', when: 'Edited Oct 22' },
]

export function DashboardScreen() {
  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-12">
      <AppTopNav />
      <FloatingToolbar />

      {/* Desktop main */}
      <main className="hidden min-h-screen pt-14 md:ml-24 md:block md:px-8 md:pb-12">
        <header className="mx-auto max-w-7xl py-12">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
                Studio Browser
              </h1>
              <p className="max-w-md text-on-surface-variant">
                Design, collaborate, and build the future on an infinite canvas.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <SearchField placeholder="Search boards, templates, or teams..." />
            </div>
          </div>

          <TemplateStrip />

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
            <WorkspaceNav className="lg:col-span-3" />
            <RecentBoards className="lg:col-span-9" />
          </div>
        </header>
      </main>

      {/* Mobile main */}
      <main className="mt-20 space-y-8 px-6 md:hidden">
        <SearchField placeholder="Search boards, templates, or teams..." />
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-sm font-bold uppercase tracking-tight text-on-surface opacity-60">
              Start with a template
            </h2>
            <span className="cursor-pointer text-xs font-semibold text-primary">
              View All
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="group flex aspect-square flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container p-4 text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Icon name="add" size="sm" />
              </div>
              <span className="text-[13px] font-bold tracking-tight">Create New</span>
            </button>
            <MobileTemplatePreview title="Project Retrospective" />
            <MobileTemplatePreview title="Creative Brainstorming" />
            <MobileTemplatePreview title="User Flowchart" />
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-tight text-on-surface opacity-60">
            Recent Boards
          </h2>
          <div className="space-y-3">
            {recent.map((r) => (
              <div
                key={r.title}
                className="flex cursor-pointer items-center gap-4 rounded-xl bg-surface-container-lowest p-3 shadow-sm transition-all active:scale-[0.98] dark:bg-surface-container"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
                  <div className="absolute inset-0 p-2 opacity-50">
                    <div className="mb-1 h-2 w-full rounded-full bg-primary/20" />
                    <div className="h-2 w-2/3 rounded-full bg-primary/20" />
                  </div>
                </div>
                <div className="min-w-0 flex-grow">
                  <h3 className="truncate text-sm font-bold text-on-surface">{r.title}</h3>
                  <p className="mt-0.5 text-[11px] font-medium text-on-surface-variant">
                    {r.when}
                  </p>
                </div>
                <button type="button" className="p-2 text-slate-400" aria-label="More">
                  <Icon name="more_vert" size="sm" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MobileBottomNav />

      <button
        type="button"
        className="action-gradient fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl shadow-blue-500/40 transition-transform hover:scale-110 active:scale-90 md:bottom-8"
        aria-label="Create new"
      >
        <Icon name="add" filled className="text-2xl text-white" />
      </button>
    </div>
  )
}

function TemplateStrip() {
  return (
    <div className="mb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-outline">
          Start with a Template
        </h2>
        <button type="button" className="text-sm font-semibold text-primary hover:underline">
          Browse Library
        </button>
      </div>
      <div className="custom-scrollbar flex gap-6 overflow-x-auto pb-6">
        <button
          type="button"
          className="group flex h-60 w-48 flex-shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-outline-variant/30 transition-all hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary transition-transform group-hover:scale-110">
            <Icon name="add" filled />
          </div>
          <span className="text-sm font-semibold">Create New</span>
        </button>
        <TemplateCard
          icon="history"
          title="Project Retrospective"
          subtitle="Evaluate what worked and what didn't."
          bg="bg-secondary-fixed"
          accent="bg-secondary-container/30"
          text="text-on-secondary-fixed"
          sub="text-on-secondary-fixed-variant"
        />
        <TemplateCard
          icon="lightbulb"
          title="Creative Brainstorming"
          subtitle="Capture ideas with rapid sticky notes."
          bg="bg-tertiary-fixed"
          accent="bg-tertiary-container/20"
          text="text-on-tertiary-fixed"
          sub="text-on-tertiary-fixed-variant"
        />
        <TemplateCard
          icon="account_tree"
          title="User Flowchart"
          subtitle="Map out the architectural journey."
          bg="bg-primary-fixed"
          accent="bg-primary-container/20"
          text="text-on-primary-fixed"
          sub="text-on-primary-fixed-variant"
        />
        <div className="group flex h-60 w-64 flex-shrink-0 cursor-pointer flex-col rounded-2xl bg-surface-container-high p-6 shadow-sm transition-all hover:shadow-lg">
          <Icon name="view_kanban" className="mb-4 text-outline" />
          <h3 className="text-lg font-bold leading-tight text-on-surface">Team Kanban</h3>
          <p className="mt-2 text-sm text-on-surface-variant">Manage tasks and project phases.</p>
        </div>
      </div>
    </div>
  )
}

function TemplateCard({
  icon,
  title,
  subtitle,
  bg,
  accent,
  text,
  sub,
}: {
  icon: string
  title: string
  subtitle: string
  bg: string
  accent: string
  text: string
  sub: string
}) {
  return (
    <div
      className={`group relative flex h-60 w-64 flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl p-6 shadow-sm transition-all hover:shadow-lg ${bg}`}
    >
      <div
        className={`absolute -bottom-4 -right-4 h-32 w-32 rounded-full blur-2xl transition-transform group-hover:scale-125 ${accent}`}
      />
      <Icon name={icon} className={`mb-4 ${text}`} />
      <h3 className={`text-lg font-bold leading-tight ${text}`}>{title}</h3>
      <p className={`mt-2 text-sm ${sub}`}>{subtitle}</p>
    </div>
  )
}

function WorkspaceNav({ className = '' }: { className?: string }) {
  return (
    <nav className={`space-y-8 ${className}`}>
      <div className="space-y-2">
        <h2 className="mb-4 ml-4 text-xs font-bold uppercase tracking-widest text-outline">
          Workspace
        </h2>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-3 rounded-xl bg-surface-container-highest px-4 py-3 font-bold text-primary transition-all"
        >
          <Icon name="home" filled />
          Home
        </a>
        {['Templates', 'Team Boards', 'Trash'].map((label, i) => (
          <a
            key={label}
            href="#"
            onClick={(e) => e.preventDefault()}
            className="group flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface-variant transition-all hover:bg-surface-container-low"
          >
            <Icon
              name={['dashboard_customize', 'groups', 'delete'][i]}
              className="group-hover:text-primary"
            />
            {label}
          </a>
        ))}
      </div>
      <div className="rounded-2xl bg-surface-container p-6">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-outline">
          Storage
        </p>
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div className="h-full w-3/4 bg-primary" />
        </div>
        <p className="text-xs font-medium text-on-surface-variant">1.2 GB of 2 GB used</p>
        <button
          type="button"
          className="mt-4 text-xs font-bold text-primary hover:text-primary-container"
        >
          Upgrade plan
        </button>
      </div>
    </nav>
  )
}

function RecentBoards({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-outline">
          Recent Boards
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg bg-surface-container-high p-1.5 text-on-surface-variant"
            aria-label="Grid view"
          >
            <Icon name="grid_view" className="text-[20px]" />
          </button>
          <button type="button" className="rounded-lg p-1.5 text-outline" aria-label="List view">
            <Icon name="list" className="text-[20px]" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {recent.map((r) => (
          <article
            key={r.title}
            className="group overflow-hidden rounded-2xl bg-surface-container-lowest shadow-card transition-all duration-300 hover:shadow-cardHover dark:bg-surface-container"
          >
            <div className="relative aspect-video overflow-hidden bg-surface-container-low p-4">
              <div className="relative h-full overflow-hidden rounded-lg border border-outline-variant/20 bg-white p-2 shadow-sm dark:bg-surface-container-lowest">
                <div className="mb-2 h-4 w-8 rounded-sm bg-secondary-fixed" />
                <div className="mb-4 ml-6 h-4 w-12 rounded-sm bg-tertiary-fixed" />
                <div className="h-10 w-20 rounded-md border border-primary-fixed" />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <div className="h-4 w-4 rounded-full bg-primary-container" />
                  <div className="h-4 w-4 rounded-full bg-secondary-container" />
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between p-4">
              <div>
                <h4 className="truncate text-sm font-bold text-on-surface">{r.title}</h4>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-tight text-outline">
                  {r.when}
                </p>
              </div>
              <button type="button" className="text-outline hover:text-on-surface">
                <Icon name="more_horiz" className="text-lg" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function MobileTemplatePreview({ title }: { title: string }) {
  return (
    <div className="cursor-pointer rounded-xl bg-surface-container-lowest p-1 shadow-sm transition-transform active:scale-95 dark:bg-surface-container">
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-surface-container-low">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="px-2 pb-2">
        <span className="block text-[12px] font-bold leading-tight text-on-surface">{title}</span>
      </div>
    </div>
  )
}
