import { useEffect, useState } from 'react';
import { fetchShipmentLocation } from '../services/location';
import type { ShipmentLocationSnapshot } from '../types';

interface ShipmentMapCardProps {
  shipmentId: string;
}

export function ShipmentMapCard({ shipmentId }: ShipmentMapCardProps) {
  const [snapshot, setSnapshot] = useState<ShipmentLocationSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchShipmentLocation(shipmentId);
        if (active) {
          setSnapshot(data);
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Unable to load Google Maps data');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSnapshot();
    return () => {
      active = false;
    };
  }, [shipmentId]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-teal">Google Maps</p>
          <h3 className="mt-1 text-lg font-semibold text-ink">Live Location Service</h3>
        </div>
        {snapshot ? (
          <a
            href={snapshot.mapsDirectionsLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:border-teal hover:text-teal"
          >
            Open directions
          </a>
        ) : null}
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-500">Loading location intelligence...</p> : null}
      {error ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</p> : null}

      {snapshot ? (
        <div className="mt-5 space-y-4">
          <img
            src={snapshot.currentLocation.staticMapUrl}
            alt={`Map preview for ${snapshot.currentLocation.formattedAddress}`}
            className="h-56 w-full rounded-2xl object-cover"
            loading="lazy"
          />
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current</p>
              <p className="mt-1 font-medium text-ink">{snapshot.currentLocation.formattedAddress}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Origin</p>
              <p className="mt-1 font-medium text-ink">{snapshot.origin.formattedAddress}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Destination</p>
              <p className="mt-1 font-medium text-ink">{snapshot.destination.formattedAddress}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}