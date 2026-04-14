import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';

const navigation = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Operations', to: '/operations' },
  { label: 'Shipments', to: '/shipments' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Alerts', to: '/alerts' },
  { label: 'Settings', to: '/settings' }
];

export function Layout({ children }: { children: ReactNode }) {
  const { logout, authMode, currentUser } = useDashboardData();
  const role = currentUser?.role ?? 'viewer';

  const roleTheme = role === 'admin'
    ? {
      shell: 'min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(185,28,28,0.14),_transparent_34%),linear-gradient(180deg,_#fff7ed_0%,_#ffedd5_100%)] text-ink',
      badge: 'text-bg-danger',
      roleLabel: 'Admin Control'
    }
    : role === 'operator'
      ? {
        shell: 'min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-ink',
        badge: 'text-bg-info',
        roleLabel: 'Operator Desk'
      }
      : {
        shell: 'min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(71,85,105,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] text-ink',
        badge: 'text-bg-secondary',
        roleLabel: 'Viewer Board'
      };

  return (
    <div className={roleTheme.shell}>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-teal">SmartChainAI</p>
            <h1 className="text-lg font-semibold text-slate">Logistics Intelligence Platform</h1>
            {currentUser ? <p className="text-xs text-slate-500">{currentUser.name} ({currentUser.role})</p> : null}
            {currentUser ? <span className={`badge ${roleTheme.badge} mt-1`}>{roleTheme.roleLabel}</span> : null}
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <nav className="flex flex-wrap items-center gap-2 rounded-3xl border border-slate-200 bg-sand p-2 shadow-sm">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    [
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      isActive ? 'bg-teal text-white shadow' : 'text-slate hover:bg-white hover:text-ink'
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2 self-start lg:self-end">
              <span className="rounded-full bg-teal-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                {authMode === 'demo' ? 'Demo mode' : 'Live auth'}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {authMode === 'demo' ? 'Exit demo' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}