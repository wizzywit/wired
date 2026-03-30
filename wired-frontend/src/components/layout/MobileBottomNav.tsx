import { Icon } from '../common/Icon';
import type { DashboardWorkspaceSection } from '../../dashboard/dashboardScreenLogic';

export function MobileBottomNav({
  activeSection,
  onSelectSection,
  onLogout,
  logoutPending = false,
}: {
  activeSection: DashboardWorkspaceSection;
  onSelectSection: (section: DashboardWorkspaceSection) => void;
  /** Dashboard: sign out without leaving the shell layout. */
  onLogout?: () => void;
  logoutPending?: boolean;
}) {
  const tabClass = (section: DashboardWorkspaceSection) =>
    `flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition-transform duration-150 active:scale-90 ${
      activeSection === section
        ? 'bg-blue-50/50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
        : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  const items: { section: DashboardWorkspaceSection; label: string; icon: string; homeFilled?: boolean }[] = [
    { section: 'home', label: 'Home', icon: 'home_app_logo', homeFilled: true },
    { section: 'templates', label: 'Templates', icon: 'dashboard_customize' },
    { section: 'team', label: 'Team', icon: 'group' },
    { section: 'trash', label: 'Trash', icon: 'delete' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full flex-col rounded-t-3xl border-t border-slate-100/10 bg-white/85 px-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 shadow-bottomNav backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/90 md:hidden">
      <div className="flex w-full items-center justify-around px-2">
        {items.map(({ section, label, icon, homeFilled }) => (
          <button
            key={section}
            type="button"
            onClick={() => onSelectSection(section)}
            className={tabClass(section)}
            aria-current={activeSection === section ? 'page' : undefined}
          >
            <Icon name={icon} size="sm" filled={Boolean(homeFilled) && activeSection === 'home'} />
            <span className="mt-1 font-sans text-[11px] font-medium uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </div>
      {onLogout ? (
        <button
          type="button"
          onClick={onLogout}
          disabled={logoutPending}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 py-2.5 text-sm font-semibold text-slate-600 transition-colors enabled:active:scale-[0.98] enabled:hover:bg-slate-100/80 disabled:opacity-50 dark:border-slate-600/50 dark:text-slate-300 dark:enabled:hover:bg-slate-800/80"
          aria-label={logoutPending ? 'Signing out…' : 'Log out'}
        >
          <Icon name="logout" size="sm" />
          {logoutPending ? 'Signing out…' : 'Log out'}
        </button>
      ) : null}
    </nav>
  );
}
