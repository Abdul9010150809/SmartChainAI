import { apiClient } from './api';
import type { OperationalInsights } from '../types';

export async function fetchOperationalInsights(): Promise<OperationalInsights> {
  const response = await apiClient.get('/analytics/operations');
  return response.data.data as OperationalInsights;
}
