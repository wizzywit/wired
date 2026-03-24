import { Link } from 'react-router-dom'
import { Button } from '../common/Button'
import { Icon } from '../common/Icon'
import { useTheme } from '../../theme/ThemeContext'

type AppTopNavProps = {
  /** e.g. canvas title after brand */
  breadcrumb?: string
  /** Show Files / Edit / View / Insert */
  showAppLinks?: boolean
  /** Extra right-side content before theme toggle */
  trailing?: React.ReactNode
  /** Presence avatars (e.g. canvas) */
  presence?: React.ReactNode
  variant?: 'default' | 'compact'
}

export function AppTopNav({
  breadcrumb,
  showAppLinks = true,
  trailing,
  presence,
  variant = 'default',
}: AppTopNavProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header
      className={`fixed top-0 z-50 flex w-full items-center justify-between border-none bg-white/85 px-4 shadow-nav backdrop-blur-md dark:bg-slate-900/85 md:px-6 ${
        variant === 'compact' ? 'h-auto py-4' : 'h-14'
      }`}
    >
      <div className="flex min-w-0 items-center gap-4 md:gap-8">
        <Link
          to="/"
          className="shrink-0 text-lg font-bold tracking-tighter text-slate-900 dark:text-slate-50"
        >
          The Wired Studio
        </Link>
        {breadcrumb ? (
          <>
            <span className="text-outline-variant">/</span>
            <span className="truncate font-semibold text-on-surface">
              {breadcrumb}
            </span>
          </>
        ) : null}
        {showAppLinks ? (
          <nav className="hidden items-center gap-4 font-sans text-sm tracking-tight md:flex">
            <a
              className="font-semibold text-primary"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Files
            </a>
            {['Edit', 'View', 'Insert'].map((label) => (
              <a
                key={label}
                className="rounded-lg px-2 py-1 text-slate-500 transition-colors hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                {label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {presence}
        <Button variant="primary" className="hidden px-5 sm:inline-flex">
          Share
        </Button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            aria-label="Notifications"
          >
            <Icon name="notifications" size="sm" />
          </button>
          {trailing}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size="sm" />
          </button>
          <div className="ml-1 h-8 w-8 overflow-hidden rounded-full ring-2 ring-white dark:ring-slate-700">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
