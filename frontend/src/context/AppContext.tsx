import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createShipment, fetchDashboardSnapshot } from '../services/dashboard';
import { activateDemoSession, clearStoredAuthState, getStoredAuthMode, getStoredToken, loginWithCredentials, signOut } from '../services/auth';
import type { DashboardSnapshot, ShipmentDraft, Shipment } from '../types';
import type { AuthMode, AuthSession } from '../services/auth';

interface AppContextValue {
  authenticated: boolean;
  authLoading: boolean;
  authMode: AuthMode;
  dashboard: DashboardSnapshot | null;
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  selectedShipmentId: string | null;
  refreshDashboard: () => Promise<void>;
  submitShipment: (payload: ShipmentDraft) => Promise<void>;
  selectShipment: (shipmentId: string | null) => void;
  login: (email: string, password: string) => Promise<AuthSession>;
  useDemoSession: () => Promise<AuthSession>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardSnapshot | null>(null);
  const [authenticated, setAuthenticated] = useState(Boolean(getStoredToken()));
  const [authMode, setAuthMode] = useState<AuthMode>(getStoredAuthMode());
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

  const refreshDashboard = async () => {
    if (!getStoredToken()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const snapshot = await fetchDashboardSnapshot();
      setDashboard(snapshot);
      setSelectedShipmentId((current) => current ?? snapshot.shipments[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        if (getStoredToken()) {
          setAuthenticated(true);
        } else if (authMode === 'demo') {
          await useDemoSessionInternal();
        } else {
          setAuthenticated(false);
        }
      } catch (cause) {
        clearStoredAuthState();
        setAuthenticated(false);
        setError(cause instanceof Error ? cause.message : 'Unable to prepare session');
      } finally {
        setAuthLoading(false);
      }

      if (getStoredToken()) {
        await refreshDashboard();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const submitShipment = async (payload: ShipmentDraft) => {
    setError(null);
    await createShipment(payload);
    await refreshDashboard();
  };

  async function login(email: string, password: string) {
    const session = await loginWithCredentials(email, password);
    setAuthMode('manual');
    setAuthenticated(true);
    await refreshDashboard();
    return session;
  }

  async function useDemoSessionInternal() {
    const session = await activateDemoSession();
    setAuthMode('demo');
    setAuthenticated(true);
    return session;
  }

  async function useDemoSession() {
    const session = await useDemoSessionInternal();
    await refreshDashboard();
    return session;
  }

  async function logout() {
    await signOut();
    clearStoredAuthState();
    setDashboard(null);
    setAuthenticated(false);
    setAuthMode('manual');
    setSelectedShipmentId(null);
  }

  const value = useMemo<AppContextValue>(() => ({
    authenticated,
    authLoading,
    authMode,
    dashboard,
    shipments: dashboard?.shipments ?? [],
    loading,
    error,
    selectedShipmentId,
    refreshDashboard,
    submitShipment,
    selectShipment: setSelectedShipmentId,
    login,
    useDemoSession,
    logout
  }), [authenticated, authLoading, authMode, dashboard, error, loading, selectedShipmentId, refreshDashboard, submitShipment, login, useDemoSession, logout]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}