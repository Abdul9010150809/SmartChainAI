import type { Shipment } from '../types';

function statusClass(status: Shipment['status']) {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700';
    case 'in_transit':
      return 'bg-blue-100 text-blue-700';
    case 'delayed':
      return 'bg-amber-100 text-amber-700';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function ShipmentTable({ shipments, selectedId, onSelect }: {
  shipments: Shipment[];
  selectedId: string | null;
  onSelect: (shipmentId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-ink">Live Shipments</h2>
        <p className="text-sm text-slate-500">Tracking, ETA, and delay signals from the operations pipeline.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Tracking</th>
              <th className="px-6 py-3 font-medium">Route</th>
              <th className="px-6 py-3 font-medium">Carrier</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">ETA</th>
              <th className="px-6 py-3 font-medium">Delay Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shipments.map((shipment) => (
              <tr
                key={shipment.id}
                onClick={() => onSelect(shipment.id)}
                className={[
                  'cursor-pointer transition hover:bg-teal-50/60',
                  selectedId === shipment.id ? 'bg-teal-50' : ''
                ].join(' ')}
              >
                <td className="px-6 py-4 font-medium text-ink">{shipment.trackingNumber}</td>
                <td className="px-6 py-4 text-slate-600">{shipment.origin} → {shipment.destination}</td>
                <td className="px-6 py-4 text-slate-600">{shipment.carrier}</td>
                <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(shipment.status)}`}>{shipment.status.replace('_', ' ')}</span></td>
                <td className="px-6 py-4 text-slate-600">{new Date(shipment.eta).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-slate-600">{Math.round(shipment.delayRisk * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}