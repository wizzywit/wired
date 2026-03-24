import { AppTopNav } from '../components/layout/AppTopNav'
import { FloatingToolbar } from '../components/layout/FloatingToolbar'
import { Icon } from '../components/common/Icon'

export function ShareScreen() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute left-40 top-20 h-64 w-64 rotate-12 rounded-xl bg-primary-container/20" />
        <div className="absolute bottom-40 right-60 -rotate-6 rounded-full bg-secondary-container/20" />
        <div className="absolute left-1/3 top-1/2 h-32 w-32 skew-y-12 rounded-lg bg-tertiary-container/10" />
        <div className="absolute inset-0 bg-[radial-gradient(#e1e3e4_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(rgba(148,163,184,0.25)_1px,transparent_1px)]" />
      </div>

      <AppTopNav />

      <FloatingToolbar />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/10 p-4 backdrop-blur-sm">
        <div className="glass-panel w-full max-w-lg overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.12)] dark:shadow-black/40">
          <div className="flex items-start justify-between px-8 pb-6 pt-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                Share & Collaborate
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Project: &quot;Quarterly Strategy Board&quot;
              </p>
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
              aria-label="Close"
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="px-8 pb-6">
            <div className="flex gap-2">
              <input
                className="flex-grow rounded-xl border-none bg-surface-container-high px-4 py-3 text-sm outline-none transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10"
                placeholder="Enter names or email addresses..."
                type="email"
              />
              <button
                type="button"
                className="action-gradient whitespace-nowrap rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
              >
                Send Invite
              </button>
            </div>
          </div>

          <div className="h-px bg-outline-variant/15" />

          <div className="max-h-[300px] space-y-4 overflow-y-auto px-8 py-6">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
              People with access
            </h3>
            <PersonRow
              name="Alex Rivera"
              email="alex@thewired.studio"
              role="Owner"
              seed="alex"
            />
            <PersonRow
              name="Sarah Chen"
              email="sarah.c@design.co"
              role="Editor"
              seed="sarah"
              showDropdown
            />
            <PersonRow
              name="Jordan Smith"
              email="j.smith@vendor.io"
              role="Viewer"
              seed="jordan"
              showDropdown
            />
          </div>

          <div className="h-px bg-outline-variant/15" />

          <div className="bg-surface-container-low/50 px-8 py-8 dark:bg-surface-container/50">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon name="link" size="sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">General access</p>
                  <p className="text-xs text-on-surface-variant">
                    Anyone with the link can <span className="font-bold text-primary">view</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="relative flex h-5 w-10 items-center rounded-full bg-primary-container px-0.5 transition-colors"
                aria-pressed="true"
              >
                <span className="ml-auto h-4 w-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-grow items-center justify-between overflow-hidden rounded-xl bg-surface-container-high px-4 py-2.5">
                <span className="truncate text-xs text-on-surface-variant">
                  https://studio.wired.app/v/39x-22k-pl8-99z...
                </span>
                <Icon name="lock" className="text-sm text-on-surface-variant/40" />
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-surface-container-highest px-5 py-2.5 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-high active:scale-95"
              >
                <Icon name="content_copy" className="text-[18px]" />
                Copy Link
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-surface-container-high/30 px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
            <span>Enterprise Shield Enabled</span>
            <span className="flex items-center gap-1">
              <Icon name="verified_user" className="text-[12px]" filled />
              End-to-End Encrypted
            </span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed right-[25%] top-[40%] z-10 flex scale-75 flex-col items-start md:scale-100">
        <Icon name="near_me" className="text-2xl text-tertiary" filled />
        <div className="-mt-0.5 rounded-lg rounded-tl-none bg-tertiary px-2 py-0.5 shadow-lg">
          <span className="font-label text-[10px] font-bold uppercase text-white">
            Sarah is editing...
          </span>
        </div>
      </div>
    </div>
  )
}

function PersonRow({
  name,
  email,
  role,
  seed,
  showDropdown,
}: {
  name: string
  email: string
  role: string
  seed: string
  showDropdown?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-surface bg-surface-container-high">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-on-surface">{name}</p>
          <p className="text-xs text-on-surface-variant">{email}</p>
        </div>
      </div>
      {showDropdown ? (
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high"
        >
          {role}
          <Icon name="expand_more" className="text-[16px]" />
        </button>
      ) : (
        <span className="px-3 text-xs font-medium text-on-surface-variant/60">{role}</span>
      )}
    </div>
  )
}
