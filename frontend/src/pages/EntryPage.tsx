import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';

export function EntryPage() {
  const navigate = useNavigate();
  const { authenticated, currentUser, useDemoSession } = useDashboardData();
  const [activatingDemo, setActivatingDemo] = useState(false);

  async function handleDemoSignup() {
    setActivatingDemo(true);
    try {
      await useDemoSession('operator');
      navigate('/dashboard');
    } finally {
      setActivatingDemo(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,_rgba(20,184,166,0.22),_transparent_42%),radial-gradient(circle_at_82%_12%,_rgba(56,189,248,0.14),_transparent_38%),linear-gradient(120deg,_#0b1324_0%,_#0f172a_44%,_#111827_100%)] px-4 py-8 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] border border-white/12 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.32)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <section>
              <p className="text-xs uppercase tracking-[0.45em] text-teal-200">SMARTCHAINAI</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
                Logistics command with predictive intelligence.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-200">
                Monitor shipments, detect risk early, and plan demand with one integrated operations platform.
              </p>

              <div className="mt-8 d-flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-light btn-lg rounded-pill px-4 fw-bold text-dark"
                  style={{ minWidth: '190px' }}
                >
                  Open Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="btn btn-outline-light btn-lg rounded-pill px-4 fw-bold"
                  style={{ minWidth: '150px' }}
                >
                  Sign In
                </button>
                {!authenticated ? (
                  <button
                    type="button"
                    onClick={() => void handleDemoSignup()}
                    className="btn btn-info btn-lg rounded-pill px-4 fw-bold text-dark"
                    style={{ minWidth: '230px' }}
                  >
                    {activatingDemo ? 'Starting demo...' : 'Sign Up (Demo Mode)'}
                  </button>
                ) : null}
              </div>
            </section>

            <section>
              <div className="rounded-4 border border-white/20 bg-white/[0.05] p-4">
                <div className="small text-uppercase text-info fw-semibold mb-2">Live Overview</div>
                <div className="row g-3">
                  {[
                    ['Live Tracking', 'Real-time shipment status and location visibility.'],
                    ['Delay Risk', 'ML-backed risk scoring with intervention focus.'],
                    ['Demand Forecast', 'Planning support from AI forecasting signals.'],
                    ['Ops Analytics', 'Delivery and transit KPIs in one place.']
                  ].map(([title, text]) => (
                    <div className="col-12" key={title}>
                      <div className="rounded-4 border border-white/10 bg-slate-900/40 p-3">
                        <div className="fw-semibold">{title}</div>
                        <div className="small text-slate-300 mt-1">{text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 rounded-4 border border-white/12 bg-white/[0.03] p-4 text-sm text-slate-200">
            {authenticated && currentUser
              ? `Signed in as ${currentUser.name} (${currentUser.role}).`
              : 'Sign in or use demo mode to access the control center.'}
          </div>
        </div>
      </div>
    </div>
  );
}
