import { useAppContext } from '../context/AppContext';

export function useDashboardData() {
  return useAppContext();
}