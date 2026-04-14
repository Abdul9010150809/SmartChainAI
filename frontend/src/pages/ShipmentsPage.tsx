import { useState, type FormEvent } from 'react';
import { Layout } from '../components/Layout';
import { useDashboardData } from '../hooks/useDashboardData';
import type { ShipmentDraft } from '../types';

const initialForm: ShipmentDraft = {
  trackingNumber: '',
  origin: '',
  destination: '',
  carrier: '',
  value: 0
};

export function ShipmentsPage() {
  const { shipments, submitShipment } = useDashboardData();
  const [form, setForm] = useState<ShipmentDraft>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await submitShipment(form);
      setForm(initialForm);
      setMessage('Shipment created and synchronized successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create shipment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.35em] text-teal">Create Shipment</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Register a new logistics lane</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {(['trackingNumber', 'origin', 'destination', 'carrier'] as const).map((field) => (
              <label key={field} className="block text-sm font-medium text-slate-700">
                <span className="capitalize">{field}</span>
                <input
                  value={form[field] as string}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal"
                />
              </label>
            ))}
            <label className="block text-sm font-medium text-slate-700">
              Value
              <input
                type="number"
                min="0"
                value={form.value}
                onChange={(event) => setForm((current) => ({ ...current, value: Number(event.target.value) }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal"
              />
            </label>
            {message ? <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Create shipment'}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.35em] text-teal">Shipment Inventory</p>
          <div className="mt-4 space-y-3">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{shipment.trackingNumber}</p>
                    <p className="text-sm text-slate-500">{shipment.origin} → {shipment.destination}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{shipment.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}