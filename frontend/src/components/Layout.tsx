import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';

const navigation = [
  { label: 'Dashboard', to: '/' },
  { label: 'Shipments', to: '/shipments' },
  { label: 'Analytics', to: '/analytics' }
];

export function Layout({ children }: { children: ReactNode }) {
  const { logout, authMode } = useDashboardData();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-ink">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-teal">SenseChainAI</p>
            <h1 className="text-lg font-semibold text-slate">Logistics Intelligence Platform</h1>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2 rounded-full border border-slate-200 bg-sand p-1 shadow-sm">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
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
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {authMode === 'demo' ? 'Exit demo' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}