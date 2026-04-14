import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Layout } from '../components/Layout';
import { ShipmentMapCard } from '../components/ShipmentMapCard';
import { useDashboardData } from '../hooks/useDashboardData';
import type { ShipmentDraft } from '../types';

const initialForm: ShipmentDraft = {
  trackingNumber: '',
  origin: '',
  destination: '',
  carrier: '',
  value: 0
};

type ShipmentFilter = 'all' | 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';

const routeSuggestions = [
  'Mumbai, IN',
  'Delhi, IN',
  'Bengaluru, IN',
  'Chennai, IN',
  'Hyderabad, IN',
  'Kolkata, IN',
  'Pune, IN',
  'Ahmedabad, IN',
  'Jaipur, IN',
  'Kochi, IN',
  'Dubai, UAE',
  'Singapore, SG'
];

const carrierSuggestions = [
  'NorthStar Freight',
  'BlueRoute Cargo',
  'ExpressLink',
  'TransGlobal Logistics',
  'OceanBridge Freight',
  'Apex Supply Lines'
];

const demoShipmentTemplates: Array<{ label: string; value: ShipmentDraft; note: string }> = [
  {
    label: 'India export lane',
    value: {
      trackingNumber: 'SC-20001',
      origin: 'Mumbai, IN',
      destination: 'Dubai, UAE',
      carrier: 'BlueRoute Cargo',
      value: 12000
    },
    note: 'Common west-bound export lane'
  },
  {
    label: 'India domestic express',
    value: {
      trackingNumber: 'SC-20002',
      origin: 'Delhi, IN',
      destination: 'Bengaluru, IN',
      carrier: 'ExpressLink',
      value: 18500
    },
    note: 'High-priority intercity movement'
  },
  {
    label: 'Port to metro',
    value: {
      trackingNumber: 'SC-20003',
      origin: 'Chennai, IN',
      destination: 'Hyderabad, IN',
      carrier: 'NorthStar Freight',
      value: 26000
    },
    note: 'Domestic replenishment corridor'
  }
];

function isIndiaLocation(value: string) {
  return /(?:,\s*IN\b|\bINDIA\b)/i.test(value);
}

function validateShipmentDraft(form: ShipmentDraft) {
  const errors: string[] = [];

  if (!/^SC-[A-Z0-9-]{4,64}$/.test((form.trackingNumber || '').trim().toUpperCase())) {
    errors.push('Tracking Number must start with SC- and use uppercase letters/numbers (example: SC-IN-202601).');
  }

  if (!form.origin.trim()) {
    errors.push('Origin is required.');
  }

  if (!form.destination.trim()) {
    errors.push('Destination is required.');
  }

  if (!form.carrier.trim()) {
    errors.push('Carrier is required.');
  }

  if (!Number.isFinite(form.value) || form.value <= 0) {
    errors.push('Declared Value must be greater than 0.');
  }

  if (form.origin.trim() && form.destination.trim() && !isIndiaLocation(form.origin) && !isIndiaLocation(form.destination)) {
    errors.push('India shipping rule: either Origin or Destination must be in India (use ", IN" or "India").');
  }

  return errors;
}

function cleanSegment(value: string) {
  return value.replace(/^[\s:-]+/, '').replace(/[\s.,;]+$/, '').trim();
}

function parseShipmentDocument(text: string): Partial<ShipmentDraft> {
  const normalized = text.replace(/\r/g, '\n');
  const result: Partial<ShipmentDraft> = {};

  const trackingMatch = normalized.match(/(?:tracking(?: number)?|shipment(?: id)?|ref(?:erence)?)[\s:=#-]*([A-Z0-9-]{4,})/i);
  const originMatch = normalized.match(/(?:origin|from)[\s:=]*([^\n]+)/i);
  const destinationMatch = normalized.match(/(?:destination|to)[\s:=]*([^\n]+)/i);
  const carrierMatch = normalized.match(/(?:carrier|logistics provider|forwarder)[\s:=]*([^\n]+)/i);
  const valueMatch = normalized.match(/(?:value|declared value|shipment value)[\s:=₹$]*([\d,]+(?:\.\d{1,2})?)/i);
  const routeMatch = normalized.match(/([A-Za-z][A-Za-z\s.-]{1,60})\s+(?:to|->|→)\s+([A-Za-z][A-Za-z\s.-]{1,60})/i);

  if (trackingMatch) {
    result.trackingNumber = cleanSegment(trackingMatch[1]).toUpperCase();
  }

  if (originMatch) {
    result.origin = cleanSegment(originMatch[1]);
  }

  if (destinationMatch) {
    result.destination = cleanSegment(destinationMatch[1]);
  }

  if (!result.origin && routeMatch) {
    result.origin = cleanSegment(routeMatch[1]);
  }

  if (!result.destination && routeMatch) {
    result.destination = cleanSegment(routeMatch[2]);
  }

  if (carrierMatch) {
    result.carrier = cleanSegment(carrierMatch[1]);
  }

  if (valueMatch) {
    result.value = Number(valueMatch[1].replace(/,/g, ''));
  }

  return result;
}

function useSpeechRecognition() {
  if (typeof window === 'undefined') {
    return null;
  }

  const browserWindow = window as unknown as {
    SpeechRecognition?: new () => any;
    webkitSpeechRecognition?: new () => any;
  };

  return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition || null;
}

function formatFieldName(field: string) {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

export function ShipmentsPage() {
  const { shipments, submitShipment, currentUser } = useDashboardData();
  const [form, setForm] = useState<ShipmentDraft>(initialForm);
  const [documentText, setDocumentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentFilter>('all');
  const [showHelp, setShowHelp] = useState(false);
  const [listening, setListening] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [mapShipmentId, setMapShipmentId] = useState<string | null>(shipments[0]?.id ?? null);

  const isViewer = currentUser?.role === 'viewer';

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch = [shipment.trackingNumber, shipment.origin, shipment.destination, shipment.carrier]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const analytics = useMemo(() => {
    const values = shipments.map((shipment) => shipment.value);
    const risks = shipments.map((shipment) => shipment.delayRisk);
    const etas = shipments.map((shipment) => new Date(shipment.eta).getTime());

    const minValue = values.length ? Math.min(...values) : 0;
    const maxValue = values.length ? Math.max(...values) : 0;
    const minRisk = risks.length ? Math.min(...risks) : 0;
    const maxRisk = risks.length ? Math.max(...risks) : 0;
    const earliestEta = etas.length ? new Date(Math.min(...etas)) : null;
    const latestEta = etas.length ? new Date(Math.max(...etas)) : null;
    const delayedCount = shipments.filter((shipment) => shipment.status === 'delayed').length;

    return {
      minValue,
      maxValue,
      minRisk,
      maxRisk,
      earliestEta,
      latestEta,
      delayedCount
    };
  }, [shipments]);

  const helperItems = [
    'Use the origin and destination suggestions to stay consistent with known lanes.',
    'Paste transport notes, invoices, or booking text to auto-fill common fields.',
    'Upload service export .txt files from docs/service-exports for quick autofill.',
    'Use voice entry to speak a route like “Mumbai to Hamburg” or a carrier name.',
    'Review min/max metrics before submitting high-value or high-risk shipments.'
  ];

  const autoFillFromDocument = () => {
    if (isViewer) {
      setMessage('Viewer account is read-only. Switch to operator/admin to create or autofill shipments.');
      return;
    }

    const parsed = parseShipmentDocument(documentText);
    setForm((current) => ({ ...current, ...parsed }));
    const updatedFields = Object.keys(parsed).join(', ');
    setMessage(updatedFields ? `Auto-filled: ${updatedFields}` : 'No matching shipment fields were found in the document.');
  };

  const handleDocumentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isViewer) {
      setMessage('Viewer account is read-only. Switch to operator/admin to use upload autofill.');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setMessage('Only .txt service export files are supported for autofill.');
      return;
    }

    try {
      const text = await file.text();
      setDocumentText(text);
      const parsed = parseShipmentDocument(text);
      setForm((current) => ({ ...current, ...parsed }));
      const updatedFields = Object.keys(parsed).join(', ');
      setMessage(updatedFields ? `Uploaded and auto-filled: ${updatedFields}` : 'File uploaded, but no shipment fields were detected.');
    } catch {
      setMessage('Unable to read uploaded file. Please try another export text file.');
    } finally {
      event.target.value = '';
    }
  };

  const startVoiceAssist = () => {
    if (isViewer) {
      setMessage('Viewer account is read-only. Voice-assisted shipment intake is disabled.');
      return;
    }

    const SpeechRecognitionImpl = useSpeechRecognition();
    if (!SpeechRecognitionImpl) {
      setMessage('Voice support is not available in this browser. Use a Chromium-based browser for microphone input.');
      return;
    }

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setMessage('Listening for shipment details...');
    };

    recognition.onresult = (event: any) => {
      const transcript = String(event.results?.[0]?.[0]?.transcript ?? '');
      const parsed = parseShipmentDocument(transcript);
      setForm((current) => ({ ...current, ...parsed }));
      setMessage(transcript ? `Voice captured: ${transcript}` : 'Voice input completed.');
    };

    recognition.onerror = () => {
      setMessage('Voice input failed. Check microphone permissions and try again.');
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isViewer) {
      setMessage('Viewer account is read-only. Shipment creation is available for operator/admin only.');
      return;
    }

    const draftErrors = validateShipmentDraft(form);
    setValidationErrors(draftErrors);

    if (draftErrors.length > 0) {
      setMessage(`Validation failed: ${draftErrors.join(' | ')}`);
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await submitShipment(form);
      setForm(initialForm);
      setDocumentText('');
      setValidationErrors([]);
      setMessage('Shipment created and synchronized successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create shipment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-4 rounded-4 border border-info-subtle bg-info-subtle p-4 text-info-emphasis">
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
          <div>
            <p className="text-uppercase small text-teal fw-semibold mb-1">Shipment Control</p>
            <h2 className="h3 mb-1">Create, search, and monitor shipments.</h2>
            <p className="text-muted mb-0">Think like a logistics engineer: reduce input errors, normalize lanes, and watch risk before dispatch.</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {(['all', 'pending', 'in_transit', 'delivered', 'delayed', 'cancelled'] as ShipmentFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={['btn rounded-pill btn-sm', statusFilter === status ? 'btn-dark' : 'btn-outline-dark'].join(' ')}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-4">
        <section className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <p className="text-uppercase small text-teal fw-semibold mb-1">Create Shipment</p>
                  <h2 className="h3 mb-2">Register a new logistics lane</h2>
                  <p className="small text-muted mb-0">
                    Signed in as {currentUser?.email ?? 'unknown user'} ({currentUser?.role ?? 'unknown role'})
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-info rounded-circle fw-bold"
                  style={{ width: '2.4rem', height: '2.4rem' }}
                  onClick={() => setShowHelp((current) => !current)}
                  aria-label="How to use shipment intake"
                >
                  i
                </button>
              </div>

              {showHelp ? (
                <div className="alert alert-info border rounded-4 mt-3 mb-0">
                  <div className="fw-semibold mb-2">How to use this intake form</div>
                  <ul className="mb-0 ps-3 small">
                    {helperItems.map((item, index) => <li key={`help-${index}-${item.slice(0, 16)}`}>{item}</li>)}
                  </ul>
                </div>
              ) : null}

              <div className="mt-3 rounded-4 border bg-light p-3">
                <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
                  <div>
                    <div className="fw-semibold">Advanced shipment intake</div>
                    <div className="text-muted small">Autofill from booking notes, invoices, or voice transcription.</div>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-dark rounded-pill" onClick={autoFillFromDocument}>
                    Autofill
                  </button>
                </div>
                <textarea
                  className="form-control rounded-4"
                  rows={6}
                  value={documentText}
                  onChange={(event) => setDocumentText(event.target.value)}
                  placeholder="Paste a document or notes here. Example: Tracking: SC-IN-202601; Origin: Mumbai, IN; Destination: Dubai, UAE; Carrier: BlueRoute Cargo; Value: 12000"
                  disabled={isViewer}
                />
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button type="button" className="btn btn-dark rounded-pill px-4" onClick={autoFillFromDocument}>
                    Auto-fill from document
                  </button>
                  <button type="button" className="btn btn-outline-dark rounded-pill px-4" onClick={startVoiceAssist} disabled={listening || isViewer}>
                    {listening ? 'Listening...' : 'Voice input'}
                  </button>
                </div>
                <div className="mt-3">
                  <label className="form-label small fw-semibold text-muted mb-1">Upload service export (.txt)</label>
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    className="form-control rounded-4"
                    onChange={handleDocumentUpload}
                    disabled={isViewer}
                  />
                </div>
                <div className="mt-3">
                  <div className="small text-uppercase fw-semibold text-muted mb-2">Demo shipment templates</div>
                  <div className="d-grid gap-2">
                    {demoShipmentTemplates.map((template) => (
                      <button
                        key={template.label}
                        type="button"
                        className="btn btn-outline-secondary text-start rounded-4"
                        onClick={() => {
                          setForm(template.value);
                          setMessage(`Loaded demo template: ${template.label}`);
                        }}
                      >
                        <div className="fw-semibold">{template.label}</div>
                        <div className="small text-muted">{template.note}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <form className="d-grid gap-3 mt-4" onSubmit={handleSubmit}>
                <div className="row g-3">
                  {(['trackingNumber', 'origin', 'destination', 'carrier'] as const).map((field) => (
                    <div className="col-12" key={field}>
                      <label className="form-label fw-semibold text-capitalize mb-1">{formatFieldName(field)}</label>
                      <input
                        value={form[field] as string}
                        onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                        className="form-control rounded-4"
                        list={field === 'carrier' ? 'carrier-suggestions' : `${field}-suggestions`}
                        placeholder={field === 'trackingNumber' ? 'SC-IN-202601' : `Enter ${field}`}
                        disabled={isViewer}
                      />
                      {(field === 'origin' || field === 'destination') ? (
                        <datalist id={`${field}-suggestions`}>
                          {routeSuggestions.map((route) => <option key={`${field}-${route}`} value={route} />)}
                        </datalist>
                      ) : null}
                    </div>
                  ))}
                </div>

                <datalist id="carrier-suggestions">
                  {carrierSuggestions.map((carrier) => <option key={carrier} value={carrier} />)}
                </datalist>

                <label className="form-label fw-semibold mb-1">Declared Value</label>
                <input
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(event) => setForm((current) => ({ ...current, value: Number(event.target.value) }))}
                  className="form-control rounded-4"
                  disabled={isViewer}
                />

                {message ? <div className="alert alert-light border mb-0">{message}</div> : null}

                {validationErrors.length ? (
                  <div className="alert alert-danger mb-0" role="alert">
                    <div className="fw-semibold mb-1">Why this failed</div>
                    <ul className="mb-0 ps-3">
                      {validationErrors.map((error, index) => <li key={`validation-${index}-${error.slice(0, 18)}`}>{error}</li>)}
                    </ul>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting || isViewer}
                  className="btn btn-dark rounded-pill px-4 py-3 fw-semibold"
                >
                  {isViewer ? 'Read-only account' : submitting ? 'Saving...' : 'Create shipment'}
                </button>
              </form>

              {isViewer ? (
                <div className="alert alert-warning mt-3 mb-0">
                  Verification hint: viewer can browse shipments and analytics but cannot create/update records.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm rounded-4 h-100 mb-4">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                <div>
                  <p className="text-uppercase small text-teal fw-semibold mb-1">Shipment Analysis</p>
                  <h3 className="h4 mb-1">Min and max performance windows</h3>
                  <p className="text-muted mb-0">Quickly spot the smallest, largest, earliest, and riskiest shipment conditions.</p>
                </div>
              </div>

              <div className="row g-3">
                {[
                  ['Min value', analytics.minValue.toLocaleString()],
                  ['Max value', analytics.maxValue.toLocaleString()],
                  ['Min risk', `${Math.round(analytics.minRisk * 100)}%`],
                  ['Max risk', `${Math.round(analytics.maxRisk * 100)}%`]
                ].map(([label, value]) => (
                  <div className="col-12 col-sm-6" key={String(label)}>
                    <div className="border rounded-4 p-3 h-100 bg-light">
                      <div className="text-muted small text-uppercase fw-semibold">{label}</div>
                      <div className="fs-4 fw-bold mt-1">{String(value)}</div>
                    </div>
                  </div>
                ))}

                <div className="col-12 col-sm-6">
                  <div className="border rounded-4 p-3 h-100 bg-light">
                    <div className="text-muted small text-uppercase fw-semibold">Earliest ETA</div>
                    <div className="fw-semibold mt-1">{analytics.earliestEta ? analytics.earliestEta.toLocaleString() : 'No data'}</div>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="border rounded-4 p-3 h-100 bg-light">
                    <div className="text-muted small text-uppercase fw-semibold">Latest ETA</div>
                    <div className="fw-semibold mt-1">{analytics.latestEta ? analytics.latestEta.toLocaleString() : 'No data'}</div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="border rounded-4 p-3 h-100 bg-light">
                    <div className="text-muted small text-uppercase fw-semibold">Delays requiring attention</div>
                    <div className="fw-semibold mt-1">{analytics.delayedCount} delayed shipment(s) in current queue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                <div>
                  <p className="text-uppercase small text-teal fw-semibold mb-1">Shipment Inventory</p>
                  <h3 className="h4 mb-1">Live shipment list</h3>
                  <p className="text-muted mb-0">Search by tracking number, route, or carrier. Use Trace to open map tracking for a shipment.</p>
                </div>
                <div className="input-group input-group-lg" style={{ maxWidth: '320px' }}>
                  <span className="input-group-text bg-white">Search</span>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="SC-10001 or carrier"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              <div className="list-group list-group-flush">
                {filteredShipments.map((shipment, index) => (
                  <div key={shipment.id || `${shipment.trackingNumber}-${index}`} className="list-group-item py-3 px-0 border-0 border-bottom">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="fw-semibold">{shipment.trackingNumber}</div>
                        <div className="text-muted small">{shipment.origin} → {shipment.destination}</div>
                        <div className="text-muted small">{shipment.carrier}</div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary mt-2 rounded-pill"
                          onClick={() => setMapShipmentId(shipment.id)}
                        >
                          Trace location
                        </button>
                      </div>
                      <div className="text-end">
                        <span className="badge text-bg-light border text-capitalize">{shipment.status.replace('_', ' ')}</span>
                        <div className="small text-muted mt-2">Value: {shipment.value.toLocaleString()}</div>
                        <div className="small text-muted">Risk: {Math.round(shipment.delayRisk * 100)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!filteredShipments.length ? <div className="text-muted mt-4">No shipments match the current filters.</div> : null}
            </div>
          </div>

          {mapShipmentId ? (
            <div className="card border-0 shadow-sm rounded-4 h-100 mt-4">
              <div className="card-body p-4">
                <div className="mb-3">
                  <p className="text-uppercase small text-teal fw-semibold mb-1">Map Trace</p>
                  <h3 className="h5 mb-1">Shipment location and route preview</h3>
                  <p className="text-muted mb-0">If Google Maps key is unavailable, fallback map tiles are shown automatically.</p>
                </div>
                <ShipmentMapCard shipmentId={mapShipmentId} />
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </Layout>
  );
}