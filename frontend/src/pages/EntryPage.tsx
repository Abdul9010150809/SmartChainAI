import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';

const featureCards = [
  {
    title: 'Live shipment tracking',
    text: 'See active lanes, current location, ETA, and delivery progress in one place.'
  },
  {
    title: 'AI delay risk',
    text: 'Spot shipments that need attention before they turn into service issues.'
  },
  {
    title: 'India-only demo data',
    text: 'Practice with realistic domestic lanes, India validation, and demo mode access.'
  },
  {
    title: 'Map trace view',
    text: 'Open a shipment and trace its route with map context and directions.'
  }
];

const capabilityRows = [
  'Role-based access for admin, operator, and viewer',
  'Autofill shipments from pasted text or TXT uploads',
  'Operational analytics with charts and risk summaries',
  'FastAPI AI forecasts for planning and prediction'
];

export function EntryPage() {
  const navigate = useNavigate();
  const { authenticated, currentUser, useDemoSession } = useDashboardData();
  const [activatingDemo, setActivatingDemo] = useState(false);
  const [searchingShipment, setSearchingShipment] = useState(false);
  const [laneQuery, setLaneQuery] = useState('Mumbai to Delhi');

  async function handleDemoSignup() {
    setActivatingDemo(true);
    try {
      await useDemoSession('operator');
      navigate('/dashboard');
    } finally {
      setActivatingDemo(false);
    }
  }

  async function handleLaneSearch() {
    const trimmedQuery = laneQuery.trim();

    setSearchingShipment(true);
    try {
      if (!authenticated) {
        await useDemoSession('operator');
      }

      navigate(trimmedQuery ? `/shipments?search=${encodeURIComponent(trimmedQuery)}` : '/shipments');
    } finally {
      setSearchingShipment(false);
    }
  }

  async function handleLoginToShipments() {
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,173,181,0.2),_transparent_28%),radial-gradient(circle_at_90%_10%,_rgba(255,186,84,0.18),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_42%,_#e9f0ff_100%)] px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border border-white/70 bg-white/90 px-5 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-teal">SMARTCHAINAI</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Logistics Intelligence Platform
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Go from shipment visibility to operational action in one clean control center.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                India-only demo lanes
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                Predictive analytics
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                Map trace enabled
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-stretch">
          <div className="overflow-hidden rounded-[2.25rem] border border-white/80 bg-[linear-gradient(135deg,_#0f172a_0%,_#0b4f6c_52%,_#0ea5a4_100%)] p-6 text-white shadow-[0_30px_100px_rgba(15,23,42,0.24)] sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/85">
                Built for logistics teams
              </p>
              <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Track shipments, predict delays, and move faster with a cleaner command center.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg">
                SmartChainAI brings together live location tracing, AI risk scoring, shipment autofill, and India-focused demo data so your team can act quickly without switching tools.
              </p>

              <div className="mt-8 rounded-[1.75rem] border border-white/15 bg-white/12 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-5">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal">Search a lane</p>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        value={laneQuery}
                        onChange={(event) => setLaneQuery(event.target.value)}
                        className="w-full border-0 bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
                        placeholder="Example: Mumbai to Delhi"
                        aria-label="Search shipment lane"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleLaneSearch()}
                    disabled={searchingShipment}
                    className="rounded-full bg-amber-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                  >
                    {searchingShipment ? 'Searching...' : 'Search shipments'}
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/80">
                  <button
                    type="button"
                    onClick={() => setLaneQuery('Mumbai to Delhi')}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-2 transition hover:bg-white/20"
                  >
                    Mumbai to Delhi
                  </button>
                  <button
                    type="button"
                    onClick={() => setLaneQuery('Chennai to Hyderabad')}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-2 transition hover:bg-white/20"
                  >
                    Chennai to Hyderabad
                  </button>
                  <button
                    type="button"
                    onClick={() => setLaneQuery('Pune to Bengaluru')}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-2 transition hover:bg-white/20"
                  >
                    Pune to Bengaluru
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Open Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => void handleLoginToShipments()}
                  className="rounded-full border border-white/30 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Login
                </button>
                {!authenticated ? (
                  <button
                    type="button"
                    onClick={() => void handleDemoSignup()}
                    className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
                  >
                    {activatingDemo ? 'Starting demo...' : 'Try Demo Mode'}
                  </button>
                ) : null}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ['99.9%', 'Operations visibility'],
                  ['5 min', 'Demo start time'],
                  ['India-only', 'Sample shipment lanes']
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4">
                    <div className="text-2xl font-semibold">{value}</div>
                    <div className="mt-1 text-sm text-white/75">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-teal">Why teams use it</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">Everything you need in one landing page</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                  Live preview
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {featureCards.map((feature) => (
                  <article key={feature.title} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                    <p className="text-sm font-semibold text-slate-950">{feature.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Built for teams</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Feature stack inspired by modern SaaS landing pages</h3>
              <div className="mt-5 space-y-3">
                {capabilityRows.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal" />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,_#fef3c7_0%,_#ecfeff_48%,_#dbeafe_100%)] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Current access</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-slate-950">
                  {authenticated && currentUser ? `${currentUser.name} (${currentUser.role})` : 'Not signed in'}
                </h3>
                <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                  {authenticated ? 'Ready to use' : 'Demo ready'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {authenticated && currentUser
                  ? 'You are already inside the platform. Open the dashboard or go straight to shipments.'
                  : 'Sign in for your workspace or start demo mode to explore the full logistics flow.'}
              </p>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
