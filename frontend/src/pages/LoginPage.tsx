import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import type { DemoRole } from '../services/auth';

const demoAccounts: Array<{ role: DemoRole; name: string; email: string; password: string; description: string }> = [
  {
    role: 'admin',
    name: 'Demo Admin',
    email: 'admin@smartchainai.ai',
    password: 'demo-admin',
    description: 'Full access to operations, analytics, and settings.'
  },
  {
    role: 'operator',
    name: 'Demo Operator',
    email: 'operator@smartchainai.ai',
    password: 'demo-operator',
    description: 'Best for shipment creation, dispatch, and live monitoring.'
  },
  {
    role: 'viewer',
    name: 'Demo Viewer',
    email: 'viewer@smartchainai.ai',
    password: 'demo-viewer',
    description: 'Read-only access for review and reporting.'
  }
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, useDemoSession } = useDashboardData();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [role, setRole] = useState<DemoRole>('operator');
  const [email, setEmail] = useState('demo@smartchainai.ai');
  const [password, setPassword] = useState('demo-access');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setMessage('Name is required to create an account');
          setLoading(false);
          return;
        }

        await register(name.trim(), email, password, role);
      } else {
        await login(email, password);
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo(role: DemoRole = 'operator') {
    setLoading(true);
    setMessage(null);

    try {
      await useDemoSession(role);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open demo session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.2),_transparent_34%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] px-3 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.45em] text-teal-200">SmartChainAI</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Logistics intelligence that moves with the network.</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            Sign in with Firebase or launch the seeded demo workspace to inspect shipment tracking, predictive risk scoring, and demand planning.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Secure auth', 'Firebase + backend session support'],
              ['Demo mode', 'Preloaded shipments and analytics'],
              ['ML service', 'Delay prediction and forecasting']
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm text-slate-300">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-4 bg-white/10 p-4 backdrop-blur-sm">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2 align-items-md-center">
              <div>
                <div className="text-uppercase small tracking-[0.35em] text-teal-100">Demo accounts</div>
                <p className="mb-0 text-slate-200">Pick a user type to preload the right experience.</p>
              </div>
            </div>
            <div className="mt-3 row g-3">
              {demoAccounts.map((account) => (
                <div className="col-12 col-md-4" key={account.role}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setName(account.name);
                      setEmail(account.email);
                      setPassword(account.password);
                      void handleDemo(account.role);
                    }}
                    className="w-100 rounded-4 border border-white/10 bg-white/5 p-3 text-start text-white transition hover:bg-white/10"
                  >
                    <div className="fw-semibold text-capitalize">{account.role}</div>
                    <div className="small text-slate-300">{account.description}</div>
                    <div className="small mt-2 text-teal-100">{account.email}</div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white p-4 text-ink shadow-2xl shadow-black/20 sm:p-6 lg:p-8">
          <div className="mb-4 rounded-3xl bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_100%)] px-5 py-4 text-white">
            <p className="mb-1 text-xs uppercase tracking-[0.35em] text-teal-100">Secure Access</p>
            <h2 className="mb-0 text-2xl font-semibold">{mode === 'signin' ? 'Sign in to continue' : 'Create your account'}</h2>
          </div>

          <div className="mt-4 grid grid-cols-2 rounded-full border border-slate-200 bg-slate-100 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={[
                'rounded-full px-4 py-2 font-medium transition',
                mode === 'signin' ? 'bg-white text-slate shadow-sm' : 'text-slate-500'
              ].join(' ')}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={[
                'rounded-full px-4 py-2 font-medium transition',
                mode === 'register' ? 'bg-white text-slate shadow-sm' : 'text-slate-500'
              ].join(' ')}
            >
              Register
            </button>
          </div>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' ? (
              <div className="d-grid gap-3">
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="form-control mt-2 w-full rounded-3xl border-slate-200 px-4 py-3"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Account Type
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as DemoRole)}
                    className="form-select mt-2 w-full rounded-3xl border-slate-200 px-4 py-3"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>
            ) : null}
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="form-control mt-2 w-full rounded-3xl border-slate-200 px-4 py-3"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="form-control mt-2 w-full rounded-3xl border-slate-200 px-4 py-3"
              />
            </label>
            {message ? <div className="alert alert-danger mb-0 rounded-4">{message}</div> : null}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark w-100 rounded-pill py-3 fw-semibold"
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void handleDemo()}
            className="btn btn-outline-success w-100 rounded-pill py-3 fw-semibold"
          >
            Open seeded demo workspace
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Demo credentials are prefilled for quick access. For production use, create an account and sign in.
          </p>
        </section>
      </div>
    </div>
  );
}