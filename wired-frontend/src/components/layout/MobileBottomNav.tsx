import { Icon } from '../common/Icon';
import type { DashboardWorkspaceSection } from '../../dashboard/dashboardScreenLogic';

export function MobileBottomNav({
  activeSection,
  onSelectSection,
}: {
  activeSection: DashboardWorkspaceSection;
  onSelectSection: (section: DashboardWorkspaceSection) => void;
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
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-3xl border-t border-slate-100/10 bg-white/85 px-4 pb-6 pt-3 shadow-bottomNav backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/90 md:hidden">
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
    </nav>
  );
}
