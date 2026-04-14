import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createShipment, fetchDashboardSnapshot } from '../services/dashboard';
import { activateDemoSession, clearStoredAuthState, fetchCurrentUser, getStoredAuthMode, getStoredToken, loginWithCredentials, registerWithCredentials, signOut } from '../services/auth';
import type { DashboardSnapshot, ShipmentDraft, Shipment } from '../types';
import type { AuthMode, AuthSession, AuthUser, DemoRole } from '../services/auth';

interface AppContextValue {
  authenticated: boolean;
  authLoading: boolean;
  authMode: AuthMode;
  currentUser: AuthUser | null;
  dashboard: DashboardSnapshot | null;
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  selectedShipmentId: string | null;
  refreshDashboard: () => Promise<void>;
  submitShipment: (payload: ShipmentDraft) => Promise<void>;
  selectShipment: (shipmentId: string | null) => void;
  login: (email: string, password: string) => Promise<AuthSession>;
  register: (name: string, email: string, password: string, role?: DemoRole) => Promise<AuthSession>;
  useDemoSession: (role?: DemoRole) => Promise<AuthSession>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function resolveShipmentId(shipment: Shipment | undefined) {
  if (!shipment) {
    return null;
  }

  return shipment.id || shipment._id || null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardSnapshot | null>(null);
  const [authenticated, setAuthenticated] = useState(Boolean(getStoredToken()));
  const [authMode, setAuthMode] = useState<AuthMode>(getStoredAuthMode());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
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
      setSelectedShipmentId((current) => {
        const availableShipmentIds = snapshot.shipments.map((shipment) => resolveShipmentId(shipment)).filter((value): value is string => Boolean(value));

        if (current && availableShipmentIds.includes(current)) {
          return current;
        }

        return availableShipmentIds[0] ?? null;
      });
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
          const user = await fetchCurrentUser();
          setCurrentUser(user);
          setAuthenticated(true);
        } else if (authMode === 'demo') {
          await useDemoSessionInternal();
        } else {
          setAuthenticated(false);
        }
      } catch (cause) {
        clearStoredAuthState();
        setCurrentUser(null);
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
    setCurrentUser(session.user);
    setAuthenticated(true);
    setSelectedShipmentId(null);
    await refreshDashboard();
    return session;
  }

  async function register(name: string, email: string, password: string, role: DemoRole = 'operator') {
    const session = await registerWithCredentials(name, email, password, role);
    setAuthMode('manual');
    setCurrentUser(session.user);
    setAuthenticated(true);
    setSelectedShipmentId(null);
    await refreshDashboard();
    return session;
  }

  async function useDemoSessionInternal(role: DemoRole = 'operator') {
    const session = await activateDemoSession(role);
    setAuthMode('demo');
    setCurrentUser(session.user);
    setAuthenticated(true);
    setSelectedShipmentId(null);
    return session;
  }

  async function useDemoSession(role: DemoRole = 'operator') {
    const session = await useDemoSessionInternal(role);
    await refreshDashboard();
    return session;
  }

  async function logout() {
    await signOut();
    clearStoredAuthState();
    setDashboard(null);
    setCurrentUser(null);
    setAuthenticated(false);
    setAuthMode('manual');
    setSelectedShipmentId(null);
  }

  const value = useMemo<AppContextValue>(() => ({
    authenticated,
    authLoading,
    authMode,
    currentUser,
    dashboard,
    shipments: dashboard?.shipments ?? [],
    loading,
    error,
    selectedShipmentId,
    refreshDashboard,
    submitShipment,
    selectShipment: setSelectedShipmentId,
    login,
    register,
    useDemoSession,
    logout
  }), [authenticated, authLoading, authMode, currentUser, dashboard, error, loading, selectedShipmentId, refreshDashboard, submitShipment, login, register, useDemoSession, logout]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}