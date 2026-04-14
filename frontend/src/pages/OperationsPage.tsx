import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useDashboardData } from '../hooks/useDashboardData';
import { fetchOperationalInsights } from '../services/operations';
import type { OperationalInsights, ShipmentStatus } from '../types';

const statusLabels: ShipmentStatus[] = ['pending', 'in_transit', 'delivered', 'delayed', 'cancelled'];

function statusBadge(status: ShipmentStatus) {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'in_transit':
      return 'primary';
    case 'delayed':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
}

export function OperationsPage() {
  const { dashboard } = useDashboardData();
  const [insights, setInsights] = useState<OperationalInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchOperationalInsights();
        setInsights(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load operations insights');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layout>
      <div className="mb-4 rounded-4 border border-info-subtle bg-info-subtle p-4 text-info-emphasis">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
          <div>
            <p className="text-uppercase small mb-1 fw-semibold">Operations Center</p>
            <h2 className="h3 mb-1">Live backlog, carrier concentration, and response priorities.</h2>
            <p className="mb-0 text-muted">A single place to review throughput health and lane-level pressure points.</p>
          </div>
          <Link to="/shipments" className="btn btn-dark rounded-pill px-4">Create shipment</Link>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {loading ? <div className="alert alert-light border">Loading operational insights...</div> : null}

      <div className="row g-4 mb-4">
        {[
          ['Total Shipments', insights?.totalShipments ?? dashboard?.shipments.length ?? 0],
          ['Active Shipments', dashboard?.overview.activeShipments ?? 0],
          ['Delayed Shipments', dashboard?.overview.delayedShipments ?? 0],
          ['Average Value', insights ? insights.averageValue.toLocaleString() : '0']
        ].map(([label, value]) => (
          <div className="col-12 col-md-6 col-xl-3" key={String(label)}>
            <div className="card h-100 border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="text-uppercase small text-muted fw-semibold">{label}</div>
                <div className="display-6 fw-bold mt-2">{String(value)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h3 className="h5 mb-1">Backlog by status</h3>
              <p className="text-muted mb-0">Operational mix across the live queue.</p>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="row g-3">
                {statusLabels.map((status) => {
                  const value = insights?.backlogByStatus?.[status] ?? 0;
                  return (
                    <div className="col-12 col-sm-6" key={status}>
                      <div className="border rounded-4 p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-semibold text-capitalize">{status.replace('_', ' ')}</span>
                          <span className={`badge text-bg-${statusBadge(status)}`}>{value}</span>
                        </div>
                        <div className="progress mt-3" style={{ height: '8px' }}>
                          <div className={`progress-bar bg-${statusBadge(status)}`} style={{ width: `${Math.min(100, value * 10)}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h3 className="h5 mb-1">Top carriers</h3>
              <p className="text-muted mb-0">Where the workload is concentrated right now.</p>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="d-grid gap-3">
                {(insights?.topCarriers ?? []).map((carrier) => (
                  <div key={carrier.carrier} className="border rounded-4 p-3">
                    <div className="d-flex justify-content-between gap-3">
                      <div>
                        <div className="fw-semibold">{carrier.carrier}</div>
                        <div className="text-muted small">{carrier.count} shipments</div>
                      </div>
                      <div className="fw-bold">{carrier.share}%</div>
                    </div>
                    <div className="progress mt-3" style={{ height: '8px' }}>
                      <div className="progress-bar bg-dark" style={{ width: `${carrier.share}%` }} />
                    </div>
                  </div>
                ))}
                {!loading && !(insights?.topCarriers.length) ? <p className="text-muted mb-0">No carrier data yet.</p> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h3 className="h5 mb-1">Response priorities</h3>
              <p className="text-muted mb-0">Suggested next actions for the operations desk.</p>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="row g-3">
                {(insights?.attentionItems ?? []).map((item) => (
                  <div className="col-12 col-lg-4" key={item.title}>
                    <div className="alert alert-light border rounded-4 h-100 mb-0">
                      <div className="fw-semibold mb-2">{item.title}</div>
                      <div className="text-muted small">{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              {loading ? <div className="text-muted mt-3">Loading operational insights...</div> : null}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h3 className="h5 mb-1">High-risk shipments</h3>
              <p className="text-muted mb-0">Shipments requiring the fastest intervention.</p>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Tracking</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(insights?.highRiskShipments ?? []).map((shipment) => (
                      <tr key={shipment.trackingNumber}>
                        <td className="fw-semibold">{shipment.trackingNumber}</td>
                        <td className="text-capitalize">{shipment.status.replace('_', ' ')}</td>
                        <td>{shipment.currentLocation}</td>
                        <td>{Math.round(shipment.delayRisk * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!loading && !(insights?.highRiskShipments.length) ? <div className="text-muted">No high-risk shipments at the moment.</div> : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}