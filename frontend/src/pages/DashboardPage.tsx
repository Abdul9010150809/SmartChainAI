import { Layout } from '../components/Layout';
import { MetricCard } from '../components/MetricCard';
import { ShipmentTable } from '../components/ShipmentTable';
import { ForecastPanel } from '../components/ForecastPanel';
import { ShipmentMapCard } from '../components/ShipmentMapCard';
import { useDashboardData } from '../hooks/useDashboardData';

export function DashboardPage() {
  const { dashboard, shipments, loading, error, selectedShipmentId, selectShipment, refreshDashboard } = useDashboardData();
  const selectedShipment = shipments.find((shipment) => shipment.id === selectedShipmentId) ?? shipments[0];

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-teal">Operations Command Center</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ink">Track shipments, forecast demand, and surface risk early.</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              SenseChainAI centralizes shipment telemetry, delivery risk scoring, and predictive analytics for logistics teams.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshDashboard()}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Refresh data
          </button>
        </div>

        {error ? <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {loading && !dashboard ? <p className="mt-6 text-sm text-slate-500">Loading live logistics data...</p> : null}

        {dashboard ? (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Active Shipments" value={dashboard.overview.activeShipments} detail="Currently moving across the network" />
              <MetricCard label="Delivered" value={dashboard.overview.deliveredShipments} detail="Completed deliveries in the selected window" />
              <MetricCard label="Delayed" value={dashboard.overview.delayedShipments} detail="Shipments requiring intervention" />
              <MetricCard label="Avg Transit" value={`${dashboard.overview.averageTransitHours}h`} detail="Average time in transit" />
              <MetricCard label="On-Time Rate" value={`${Math.round(dashboard.overview.onTimeRate * 100)}%`} detail="Service-level performance" />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
              <ShipmentTable shipments={shipments} selectedId={selectedShipmentId} onSelect={selectShipment} />
              <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-soft">
                <p className="text-xs uppercase tracking-[0.3em] text-teal-200">Selected Shipment</p>
                {selectedShipment ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-2xl font-semibold">{selectedShipment.trackingNumber}</h3>
                      <p className="text-sm text-slate-300">{selectedShipment.origin} → {selectedShipment.destination}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-white/5 p-4">
                        <span className="text-slate-300">Carrier</span>
                        <p className="mt-1 font-medium">{selectedShipment.carrier}</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-4">
                        <span className="text-slate-300">Current Location</span>
                        <p className="mt-1 font-medium">{selectedShipment.currentLocation}</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-4">
                        <span className="text-slate-300">ETA</span>
                        <p className="mt-1 font-medium">{new Date(selectedShipment.eta).toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-4">
                        <span className="text-slate-300">Delay Risk</span>
                        <p className="mt-1 font-medium">{Math.round(selectedShipment.delayRisk * 100)}%</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Recent Events</h4>
                      <div className="mt-3 space-y-3">
                        {selectedShipment.events.map((event) => (
                          <div key={event.id} className="rounded-2xl bg-white/5 p-4">
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-slate-300">{event.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>

            <div className="mt-8">
              <ForecastPanel delayRisk={dashboard.delayRisk} demandForecast={dashboard.demandForecast} />
            </div>

            {selectedShipmentId ? (
              <div className="mt-8">
                <ShipmentMapCard shipmentId={selectedShipmentId} />
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </Layout>
  );
}