import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-3xl border-t border-slate-100/10 bg-white/85 px-4 pb-6 pt-3 shadow-bottomNav backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/90 md:hidden">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition-transform duration-150 active:scale-90 ${
            isActive
              ? 'bg-blue-50/50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`
        }
      >
        <Icon name="home_app_logo" size="sm" filled />
        <span className="mt-1 font-sans text-[11px] font-medium uppercase tracking-wider">
          Home
        </span>
      </NavLink>
      {[
        { label: 'Templates', icon: 'dashboard_customize' as const },
        { label: 'Team', icon: 'group' as const },
        { label: 'Trash', icon: 'delete' as const },
      ].map(({ label, icon }) => (
        <button
          key={label}
          type="button"
          className="flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 text-slate-400 transition-transform duration-150 hover:text-slate-900 active:scale-90 dark:hover:text-slate-100"
        >
          <Icon name={icon} size="sm" />
          <span className="mt-1 font-sans text-[11px] font-medium uppercase tracking-wider">
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}
