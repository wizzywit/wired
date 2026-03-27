import { Icon } from '../components/common/Icon';
import type { DashboardWorkspaceSection } from './dashboardScreenLogic';

const NAV_ITEMS: { id: DashboardWorkspaceSection; label: string; icon: string; filled?: boolean }[] = [
  { id: 'home', label: 'Home', icon: 'home', filled: true },
  { id: 'templates', label: 'Templates', icon: 'dashboard_customize' },
  { id: 'team', label: 'Team Boards', icon: 'groups' },
  { id: 'trash', label: 'Trash', icon: 'delete' },
];

export default function WorkspaceNav({
  className = '',
  activeSection,
  onSelectSection,
}: {
  className?: string;
  activeSection: DashboardWorkspaceSection;
  onSelectSection: (section: DashboardWorkspaceSection) => void;
}) {
  return (
    <nav className={`space-y-8 ${className}`}>
      <div className="space-y-2">
        <h2 className="mb-4 ml-4 text-xs font-bold uppercase tracking-widest text-outline">Workspace</h2>
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                active
                  ? 'bg-surface-container-highest font-bold text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <Icon name={item.icon} filled={Boolean(item.filled) && active} className={active ? '' : 'group-hover:text-primary'} />
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="rounded-2xl bg-surface-container p-6">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-outline">Storage</p>
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div className="h-full w-3/4 bg-primary" />
        </div>
        <p className="text-xs font-medium text-on-surface-variant">1.2 GB of 2 GB used</p>
        <button type="button" className="mt-4 text-xs font-bold text-primary hover:text-primary-container">
          Upgrade plan
        </button>
      </div>
    </nav>
  );
}
