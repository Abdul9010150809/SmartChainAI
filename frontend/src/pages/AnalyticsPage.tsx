import { Layout } from '../components/Layout';
import { useDashboardData } from '../hooks/useDashboardData';

export function AnalyticsPage() {
  const { dashboard } = useDashboardData();

  if (!dashboard) {
    return (
      <Layout>
        <p className="text-slate-500">Loading analytics...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">Operational KPIs</h2>
          <div className="mt-4 space-y-4">
            {Object.entries(dashboard.overview).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-medium text-ink">{key}</span>
                <span className="text-slate-500">{typeof value === 'number' && value <= 1 ? `${Math.round(value * 100)}%` : value}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">Forecast Horizon</h2>
          <div className="mt-4 space-y-3">
            {dashboard.demandForecast.map((point) => (
              <div key={point.period} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                <span className="font-medium text-ink">{point.period}</span>
                <span className="text-slate-600">{point.expectedOrders} orders</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}