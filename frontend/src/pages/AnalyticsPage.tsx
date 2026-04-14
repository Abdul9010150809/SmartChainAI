import { Layout } from '../components/Layout';
import { useDashboardData } from '../hooks/useDashboardData';

export function AnalyticsPage() {
  const { dashboard, shipments } = useDashboardData();

  if (!dashboard) {
    return (
      <Layout>
        <p className="text-slate-500">Loading analytics...</p>
      </Layout>
    );
  }

  const total = Math.max(1, shipments.length);
  const byStatus = {
    pending: shipments.filter((item) => item.status === 'pending').length,
    in_transit: shipments.filter((item) => item.status === 'in_transit').length,
    delivered: shipments.filter((item) => item.status === 'delivered').length,
    delayed: shipments.filter((item) => item.status === 'delayed').length,
    cancelled: shipments.filter((item) => item.status === 'cancelled').length
  };

  const maxForecast = Math.max(1, ...dashboard.demandForecast.map((item) => item.expectedOrders));
  const chartWidth = 640;
  const chartHeight = 220;
  const leftPadding = 34;
  const topPadding = 18;
  const xStep = dashboard.demandForecast.length > 1
    ? (chartWidth - leftPadding * 2) / (dashboard.demandForecast.length - 1)
    : 0;

  const points = dashboard.demandForecast.map((item, index) => {
    const x = leftPadding + index * xStep;
    const y = chartHeight - topPadding - (item.expectedOrders / maxForecast) * (chartHeight - topPadding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <Layout>
      <div className="mb-4 rounded-4 border border-primary-subtle bg-white p-4 shadow-sm">
        <p className="text-uppercase small text-teal fw-semibold mb-1">Analytics Studio</p>
        <h2 className="h3 mb-1">Operational KPIs and demand forecasting.</h2>
        <p className="text-muted mb-0">Understand service-level trends and planning demand with clearer visual summaries.</p>
      </div>

      <div className="row g-4">
        <section className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5">Operational KPIs</h3>
              <div className="row g-3 mt-1">
                {Object.entries(dashboard.overview).map(([key, value]) => (
                  <div key={key} className="col-12 col-sm-6">
                    <div className="border rounded-4 p-3 h-100 bg-light">
                      <div className="text-muted small text-capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="fs-4 fw-bold mt-1">{typeof value === 'number' && value <= 1 ? `${Math.round(value * 100)}%` : value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5">Forecast horizon</h3>
              <div className="d-grid gap-3 mt-3">
                {dashboard.demandForecast.map((point) => (
                  <div key={point.period} className="border rounded-4 p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{point.period}</div>
                      <div className="small text-muted">Projected planning volume</div>
                    </div>
                    <div className="badge text-bg-dark rounded-pill px-3 py-2">{point.expectedOrders} orders</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5 mb-1">Demand trend chart</h3>
              <p className="text-muted mb-3">Forecasted order volume over the planning horizon.</p>

              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-100" role="img" aria-label="Demand forecast trend chart">
                <rect x="0" y="0" width={chartWidth} height={chartHeight} rx="14" fill="#f8fafc" />
                <line x1={leftPadding} y1={chartHeight - topPadding} x2={chartWidth - leftPadding} y2={chartHeight - topPadding} stroke="#cbd5e1" strokeWidth="1" />
                <line x1={leftPadding} y1={topPadding} x2={leftPadding} y2={chartHeight - topPadding} stroke="#cbd5e1" strokeWidth="1" />

                <polyline
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={points}
                />

                {dashboard.demandForecast.map((item, index) => {
                  const x = leftPadding + index * xStep;
                  const y = chartHeight - topPadding - (item.expectedOrders / maxForecast) * (chartHeight - topPadding * 2);
                  return (
                    <g key={item.period}>
                      <circle cx={x} cy={y} r="4.5" fill="#0f766e" />
                      <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fill="#334155">{item.expectedOrders}</text>
                      <text x={x} y={chartHeight - 6} textAnchor="middle" fontSize="10" fill="#64748b">{item.period}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </section>

        <section className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5 mb-1">Shipment status mix</h3>
              <p className="text-muted mb-3">Distribution across operational states.</p>

              <div className="d-grid gap-2">
                {[
                  ['In transit', byStatus.in_transit, 'bg-info'],
                  ['Delivered', byStatus.delivered, 'bg-success'],
                  ['Delayed', byStatus.delayed, 'bg-warning'],
                  ['Pending', byStatus.pending, 'bg-secondary'],
                  ['Cancelled', byStatus.cancelled, 'bg-danger']
                ].map(([label, value, color]) => (
                  <div key={String(label)}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{label}</span>
                      <span>{value} ({Math.round((Number(value) / total) * 100)}%)</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div className={`progress-bar ${String(color)}`} style={{ width: `${Math.max(3, (Number(value) / total) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="col-12">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5 mb-1">Risk leaderboard</h3>
              <p className="text-muted mb-3">Top shipment risks ranked by probability.</p>

              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Shipment</th>
                      <th>Reason</th>
                      <th style={{ width: '320px' }}>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.delayRisk.map((item) => (
                      <tr key={item.label}>
                        <td className="fw-semibold">{item.label}</td>
                        <td className="text-muted small">{item.reason}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: '10px' }}>
                              <div className="progress-bar bg-danger" style={{ width: `${Math.round(item.probability * 100)}%` }} />
                            </div>
                            <span className="small fw-semibold">{Math.round(item.probability * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}