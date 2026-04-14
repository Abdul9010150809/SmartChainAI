import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, useDemoSession } = useDashboardData();
  const [email, setEmail] = useState('demo@sensechainai.ai');
  const [password, setPassword] = useState('demo-access');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    setMessage(null);

    try {
      await useDemoSession();
      navigate('/', { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open demo session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.18),_transparent_34%),linear-gradient(180deg,_#0f172a_0%,_#1e293b_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.45em] text-teal-200">SenseChainAI</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">Logistics intelligence that moves with the network.</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            Sign in with a real account or launch the seeded demo workspace to inspect shipment tracking, predictive risk scoring, and demand planning.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Real auth', 'JWT login and protected routes'],
              ['Demo mode', 'Preloaded shipments and analytics'],
              ['ML service', 'Delay prediction and forecasting']
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white p-8 text-ink shadow-2xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.35em] text-teal">Secure Access</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate">Sign in to continue</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal"
              />
            </label>
            {message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void handleDemo()}
            className="w-full rounded-full border border-teal/30 bg-teal/10 px-5 py-3 text-sm font-semibold text-teal transition hover:bg-teal/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Open seeded demo workspace
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Demo credentials are prefilled for quick access. Replace them with a real account to use production flows.
          </p>
        </section>
      </div>
    </div>
  );
}