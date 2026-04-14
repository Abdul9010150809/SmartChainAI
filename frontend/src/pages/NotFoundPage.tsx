import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

export function NotFoundPage() {
  return (
    <Layout>
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-teal">404</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink">Page not found</h2>
        <p className="mt-2 text-slate-500">The route does not exist in the current logistics workspace.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Return home
        </Link>
      </div>
    </Layout>
  );
}