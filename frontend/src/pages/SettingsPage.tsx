import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useDashboardData } from '../hooks/useDashboardData';

const preferenceKey = 'smartchainai.preferences';

interface Preferences {
  compactMode: boolean;
  emailAlerts: boolean;
  liveRefresh: boolean;
}

const defaultPreferences: Preferences = {
  compactMode: false,
  emailAlerts: true,
  liveRefresh: true
};

export function SettingsPage() {
  const { currentUser, authMode, logout, useDemoSession } = useDashboardData();
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const stored = window.localStorage.getItem(preferenceKey);
    if (stored) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) as Preferences });
      } catch {
        setPreferences(defaultPreferences);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(preferenceKey, JSON.stringify(preferences));
  }, [preferences]);

  return (
    <Layout>
      <div className="mb-4 rounded-4 border border-success-subtle bg-success-subtle p-4 text-success-emphasis">
        <p className="text-uppercase small mb-1 fw-semibold">Workspace Settings</p>
        <h2 className="h3 mb-1">Tune the experience for your team.</h2>
        <p className="mb-0 text-muted">Adjust display preferences, review session details, and manage auth mode.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5">Profile</h3>
              <div className="mt-3 d-grid gap-2">
                <div className="border rounded-4 p-3">
                  <div className="small text-muted">Name</div>
                  <div className="fw-semibold">{currentUser?.name ?? 'Demo User'}</div>
                </div>
                <div className="border rounded-4 p-3">
                  <div className="small text-muted">Email</div>
                  <div className="fw-semibold">{currentUser?.email ?? 'Not signed in'}</div>
                </div>
                <div className="border rounded-4 p-3">
                  <div className="small text-muted">Role</div>
                  <div className="fw-semibold text-capitalize">{currentUser?.role ?? 'viewer'}</div>
                </div>
                <div className="border rounded-4 p-3">
                  <div className="small text-muted">Auth Mode</div>
                  <div className="fw-semibold text-capitalize">{authMode}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5">Preferences</h3>
              <div className="d-grid gap-3 mt-3">
                {[
                  ['Compact mode', 'Tighter cards and denser tables.'],
                  ['Email alerts', 'Notify on delayed shipments and severe risk.'],
                  ['Live refresh', 'Auto-refresh dashboard content when you return.']
                ].map(([label, description], index) => {
                  const keys: (keyof Preferences)[] = ['compactMode', 'emailAlerts', 'liveRefresh'];
                  const key = keys[index];
                  return (
                    <label key={label} className="border rounded-4 p-3 d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="fw-semibold">{label}</div>
                        <div className="small text-muted">{description}</div>
                      </div>
                      <input
                        type="checkbox"
                        className="form-check-input mt-1"
                        checked={preferences[key]}
                        onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))}
                      />
                    </label>
                  );
                })}
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <button type="button" className="btn btn-dark rounded-pill px-4" onClick={() => void useDemoSession()}>
                  Re-open demo session
                </button>
                <button type="button" className="btn btn-outline-dark rounded-pill px-4" onClick={() => void logout()}>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h3 className="h5">Integration status</h3>
              <div className="row g-3 mt-1">
                {[
                  ['Backend API', 'Connected through JWT session and analytics endpoints.'],
                  ['Firebase Auth', 'Available when environment variables are configured.'],
                  ['Bootstrap UI', 'Loaded globally for forms, alerts, and responsive controls.'],
                  ['Local Storage', 'Retains auth mode, token, and user preferences.']
                ].map(([label, description]) => (
                  <div className="col-12 col-md-6" key={label}>
                    <div className="border rounded-4 p-3 h-100">
                      <div className="fw-semibold">{label}</div>
                      <div className="text-muted small mt-1">{description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h3 className="h5">Role Access Matrix</h3>
              <p className="text-muted mb-3">Quick verification of what each account can do in SmartChainAI.</p>
              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Capability</th>
                      <th>Admin</th>
                      <th>Operator</th>
                      <th>Viewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['View dashboard, shipments, analytics', 'Yes', 'Yes', 'Yes'],
                      ['Create shipment', 'Yes', 'Yes', 'No'],
                      ['Update status and add events', 'Yes', 'Yes', 'No'],
                      ['Use autofill + voice intake', 'Yes', 'Yes', 'No'],
                      ['Manage settings and session controls', 'Yes', 'Yes', 'Yes']
                    ].map((row) => (
                      <tr key={row[0]}>
                        <td className="fw-semibold">{row[0]}</td>
                        <td>{row[1]}</td>
                        <td>{row[2]}</td>
                        <td>{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}