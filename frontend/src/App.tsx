import { Navigate, Route, Routes } from 'react-router-dom';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardPage } from './pages/DashboardPage';
import { OperationsPage } from './pages/OperationsPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { EntryPage } from './pages/EntryPage';

export default function App() {
  const { authenticated, authLoading } = useDashboardData();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300">
          Loading SmartChainAI...
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route path="/operations" element={<Navigate to="/login" replace />} />
        <Route path="/shipments" element={<Navigate to="/login" replace />} />
        <Route path="/analytics" element={<Navigate to="/login" replace />} />
        <Route path="/alerts" element={<Navigate to="/login" replace />} />
        <Route path="/settings" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/operations" element={<OperationsPage />} />
      <Route path="/shipments" element={<ShipmentsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}