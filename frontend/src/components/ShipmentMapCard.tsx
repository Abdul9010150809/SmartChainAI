import { useEffect, useState } from 'react';
import { fetchShipmentLocation } from '../services/location';
import type { ShipmentLocationSnapshot } from '../types';

interface ShipmentMapCardProps {
  shipmentId: string;
}

function LocalMapIllustration({ current, origin, destination }: Pick<ShipmentLocationSnapshot, 'currentLocation' | 'origin' | 'destination'>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal">Local map preview</p>
          <p className="text-sm text-slate-500">Built-in route illustration</p>
        </div>
        <div className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal">
          Offline safe
        </div>
      </div>

      <div className="relative h-56 w-full bg-[radial-gradient(circle_at_20%_20%,_rgba(45,212,191,0.18),_transparent_28%),radial-gradient(circle_at_80%_25%,_rgba(59,130,246,0.16),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_100%)]">
        <svg viewBox="0 0 800 360" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="routeLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g opacity="0.6">
            {Array.from({ length: 9 }).map((_, index) => (
              <path key={`h-${index}`} d={`M0 ${40 + index * 34} H800`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 8" />
            ))}
            {Array.from({ length: 11 }).map((_, index) => (
              <path key={`v-${index}`} d={`M${40 + index * 68} 0 V360`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 8" />
            ))}
          </g>

          <path
            d="M120 260 C220 200, 280 205, 360 170 S520 110, 630 145 S720 190, 740 110"
            fill="none"
            stroke="url(#routeLine)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#softGlow)"
          />

          <circle cx="120" cy="260" r="16" fill="#ffffff" stroke="#0f766e" strokeWidth="8" />
          <circle cx="730" cy="114" r="16" fill="#ffffff" stroke="#0284c7" strokeWidth="8" />
          <circle cx="380" cy="164" r="12" fill="#ffffff" stroke="#64748b" strokeWidth="6" />

          <path d="M214 286 L258 236 L302 286 Z" fill="#fef3c7" opacity="0.95" />
          <path d="M582 116 L628 72 L674 116 Z" fill="#dbeafe" opacity="0.95" />

          <g opacity="0.9">
            <rect x="38" y="48" rx="18" ry="18" width="170" height="74" fill="#ffffff" stroke="#cbd5e1" />
            <text x="62" y="78" fontSize="18" fill="#0f172a" fontWeight="700">{origin.formattedAddress}</text>
            <text x="62" y="101" fontSize="13" fill="#64748b">Origin</text>

            <rect x="592" y="38" rx="18" ry="18" width="170" height="74" fill="#ffffff" stroke="#cbd5e1" />
            <text x="616" y="68" fontSize="18" fill="#0f172a" fontWeight="700">{destination.formattedAddress}</text>
            <text x="616" y="91" fontSize="13" fill="#64748b">Destination</text>

            <rect x="286" y="286" rx="18" ry="18" width="220" height="56" fill="#ffffff" stroke="#cbd5e1" />
            <text x="310" y="318" fontSize="18" fill="#0f172a" fontWeight="700">{current.formattedAddress}</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export function ShipmentMapCard({ shipmentId }: ShipmentMapCardProps) {
  const [snapshot, setSnapshot] = useState<ShipmentLocationSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const foliumMapHtml = snapshot?.foliumMapHtml?.trim() ?? '';
  const hasFoliumMap = foliumMapHtml.length > 0;

  function openFoliumMapInNewTab() {
    if (!hasFoliumMap) {
      return;
    }

    const mapWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!mapWindow) {
      setError('Popup blocked. Please allow popups to open the interactive map.');
      return;
    }

    mapWindow.document.open();
    mapWindow.document.write(foliumMapHtml);
    mapWindow.document.close();
  }

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchShipmentLocation(shipmentId);
        if (active) {
          setSnapshot(data);
          setImageFailed(false);
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
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${hasFoliumMap ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {hasFoliumMap ? 'Folium map active' : 'Static map fallback'}
          </span>

          {hasFoliumMap ? (
            <button
              type="button"
              onClick={openFoliumMapInNewTab}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:border-teal hover:text-teal"
            >
              Open interactive map
            </button>
          ) : null}

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
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-500">Loading location intelligence...</p> : null}
      {error ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</p> : null}

      {snapshot ? (
        <div className="mt-5 space-y-4">
          {hasFoliumMap ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <iframe
                title={`Folium route map for ${snapshot.trackingNumber}`}
                srcDoc={foliumMapHtml}
                className="h-72 w-full border-0"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : imageFailed ? (
            <LocalMapIllustration
              current={snapshot.currentLocation}
              origin={snapshot.origin}
              destination={snapshot.destination}
            />
          ) : (
            <img
              src={snapshot.currentLocation.staticMapUrl}
              alt={`Map preview for ${snapshot.currentLocation.formattedAddress}`}
              className="h-56 w-full rounded-2xl object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          )}
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