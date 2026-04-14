import { Layout } from '../components/Layout';
import { useDashboardData } from '../hooks/useDashboardData';

export function AlertsPage() {
  const { dashboard } = useDashboardData();

  const shipments = dashboard?.shipments ?? [];
  const alerts = shipments
    .map((shipment) => {
      const risk = shipment.delayRisk;
      const status = shipment.status;
      const level = status === 'delayed' || risk >= 0.8 ? 'danger' : risk >= 0.55 ? 'warning' : 'success';
      return {
        id: shipment.id,
        title: shipment.trackingNumber,
        level,
        headline: status === 'delayed'
          ? 'Shipment already delayed'
          : risk >= 0.8
            ? 'Critical delay risk'
            : risk >= 0.55
              ? 'Elevated delay risk'
              : 'Stable shipment',
        detail: `${shipment.origin} → ${shipment.destination} | ${shipment.carrier}`,
        note: shipment.status === 'delayed'
          ? 'Escalate to dispatch immediately and verify customs or handoff status.'
          : 'Continue monitoring and notify the next control point if the risk increases.'
      };
    })
    .sort((left, right) => (left.level === 'danger' ? -1 : right.level === 'danger' ? 1 : right.level === 'warning' ? 1 : -1));

  return (
    <Layout>
      <div className="mb-4 rounded-4 border border-warning-subtle bg-warning-subtle p-4 text-warning-emphasis">
        <p className="text-uppercase small mb-1 fw-semibold">Alert Center</p>
        <h2 className="h3 mb-1">Operational alerts and recommended responses.</h2>
        <p className="mb-0 text-muted">Review high-risk lanes, delayed shipments, and next-step guidance in one place.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5">Alert summary</h3>
              <div className="d-grid gap-3 mt-3">
                {[
                  ['Critical', alerts.filter((alert) => alert.level === 'danger').length],
                  ['Warning', alerts.filter((alert) => alert.level === 'warning').length],
                  ['Stable', alerts.filter((alert) => alert.level === 'success').length]
                ].map(([label, value]) => (
                  <div key={String(label)} className="border rounded-4 p-3 d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">{label}</span>
                    <span className="badge text-bg-dark rounded-pill">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5">Active alerts</h3>
              <div className="d-grid gap-3 mt-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`alert alert-${alert.level === 'danger' ? 'danger' : alert.level === 'warning' ? 'warning' : 'success'} rounded-4 mb-0`}>
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                      <div>
                        <div className="fw-semibold">{alert.title}</div>
                        <div className="small text-muted">{alert.detail}</div>
                        <div className="mt-2">{alert.headline}</div>
                        <div className="small mt-1">{alert.note}</div>
                      </div>
                      <span className={`badge text-bg-${alert.level}`}>{alert.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}