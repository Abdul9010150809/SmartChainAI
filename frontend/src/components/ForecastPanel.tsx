import type { DemandForecastItem, DelayRiskItem } from '../types';

export function ForecastPanel({ delayRisk, demandForecast }: {
  delayRisk: DelayRiskItem[];
  demandForecast: DemandForecastItem[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Delay Prediction</h2>
        <p className="mt-1 text-sm text-slate-500">Risk-ranked shipments based on route, weather, and dwell-time signals.</p>
        <div className="mt-4 space-y-4">
          {delayRisk.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink">{item.label}</span>
                <span className="text-slate-500">{Math.round(item.probability * 100)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-gradient-to-r from-teal to-amber" style={{ width: `${Math.min(100, item.probability * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{item.reason}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Demand Forecast</h2>
        <p className="mt-1 text-sm text-slate-500">Projection of order volume for planning, staffing, and vehicle allocation.</p>
        <div className="mt-6 space-y-4">
          {demandForecast.map((item) => (
            <div key={item.period} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="font-medium text-ink">{item.period}</span>
              <span className="text-sm text-slate-600">{item.expectedOrders} orders</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}