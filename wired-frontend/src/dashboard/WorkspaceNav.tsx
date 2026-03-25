import { Icon } from '../components/common/Icon';

export default function WorkspaceNav({ className = '' }: { className?: string }) {
  return (
    <nav className={`space-y-8 ${className}`}>
      <div className="space-y-2">
        <h2 className="mb-4 ml-4 text-xs font-bold uppercase tracking-widest text-outline">Workspace</h2>
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
            <Icon name={['dashboard_customize', 'groups', 'delete'][i]} className="group-hover:text-primary" />
            {label}
          </a>
        ))}
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
