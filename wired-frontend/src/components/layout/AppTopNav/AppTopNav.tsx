import { Link } from 'react-router-dom';
import { Button } from '../../common/Button';
import { Icon } from '../../common/Icon';
import { useTheme } from '../../../theme/ThemeContext';
import { useAppTopNavBreadcrumbUseCase } from './useAppTopNavBreadcrumbUseCase';

type AppTopNavProps = {
  /** e.g. canvas title after brand */
  breadcrumb?: string;
  /** Double-click breadcrumb to edit; only shown when this is set */
  onRenameBreadcrumb?: (nextTitle: string) => Promise<void> | void;
  /** Show Files / Edit / View / Insert */
  showAppLinks?: boolean;
  /** Extra right-side content before theme toggle */
  trailing?: React.ReactNode;
  /** Presence avatars (e.g. canvas) */
  presence?: React.ReactNode;
  showShareButton?: boolean;
  onShareClick?: () => void;
  shareDisabled?: boolean;
  variant?: 'default' | 'compact';
  /** Show log out control (pass with `onLogout`). */
  showLogout?: boolean;
  onLogout?: () => void;
  logoutPending?: boolean;
};

export function AppTopNav({
  breadcrumb,
  onRenameBreadcrumb,
  showAppLinks = false,
  showShareButton = true,
  onShareClick,
  shareDisabled = false,
  trailing,
  presence,
  variant = 'default',
  showLogout = false,
  onLogout,
  logoutPending = false,
}: AppTopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const { editing, draft, saving, inputRef, setDraft, startEdit, commitEdit, onInputKeyDown, onDisplayKeyDown } =
    useAppTopNavBreadcrumbUseCase({
      breadcrumb,
      onRenameBreadcrumb,
    });

  return (
    <header
      className={`fixed top-0 z-50 flex w-full items-center justify-between border-none bg-white/85 px-4 shadow-nav backdrop-blur-md dark:bg-slate-900/85 md:px-6 ${
        variant === 'compact' ? 'h-auto py-4' : 'h-14'
      }`}
    >
      <div className="flex min-w-0 items-center gap-4 md:gap-8">
        <Link to="/" className="shrink-0 text-lg font-bold tracking-tighter text-slate-900 dark:text-slate-50">
          The Wired Studio
        </Link>
        {breadcrumb ? (
          <>
            <span className="text-outline-variant">/</span>
            {editing ? (
              <input
                ref={inputRef}
                type="text"
                value={draft}
                disabled={saving}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => void commitEdit()}
                onKeyDown={onInputKeyDown}
                className="min-w-0 max-w-[min(100%,24rem)] rounded-md border border-primary/40 bg-surface-container-lowest px-2 py-0.5 text-sm font-semibold text-on-surface outline-none ring-primary/30 focus:ring-2 dark:bg-surface-container"
                aria-label="Document name"
                maxLength={120}
              />
            ) : (
              <span
                role={onRenameBreadcrumb ? 'button' : undefined}
                tabIndex={onRenameBreadcrumb ? 0 : undefined}
                title={onRenameBreadcrumb ? 'Double-click to rename' : undefined}
                onDoubleClick={() => {
                  startEdit();
                }}
                onKeyDown={onDisplayKeyDown}
                className={`truncate font-semibold text-on-surface ${
                  onRenameBreadcrumb
                    ? 'cursor-text rounded-md px-1 outline-none hover:bg-surface-container-low/80 focus-visible:ring-2 focus-visible:ring-primary/40'
                    : ''
                }`}
              >
                {breadcrumb}
              </span>
            )}
          </>
        ) : null}
        {showAppLinks ? (
          <nav className="hidden items-center gap-4 font-sans text-sm tracking-tight md:flex">
            <a className="font-semibold text-primary" href="#" onClick={(e) => e.preventDefault()}>
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
        {showShareButton ? (
          <Button
            variant="primary"
            className="hidden px-5 sm:inline-flex"
            onClick={onShareClick}
            disabled={shareDisabled || !onShareClick}
          >
            Share
          </Button>
        ) : null}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            aria-label="Notifications"
          >
            <Icon name="notifications" size="sm" />
          </button>
          {trailing}
          {showLogout && onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              disabled={logoutPending}
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100/50 enabled:hover:text-red-600 dark:hover:bg-slate-800/50 dark:enabled:hover:text-red-400"
              aria-label={logoutPending ? 'Signing out…' : 'Log out'}
            >
              <Icon name="logout" size="sm" />
            </button>
          ) : null}
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
  );
}
