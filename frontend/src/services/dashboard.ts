import { apiClient } from './api';
import type { DashboardSnapshot, ShipmentDraft } from '../types';

export async function fetchDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [overviewResponse, shipmentsResponse, delayRiskResponse, forecastResponse] = await Promise.all([
    apiClient.get('/analytics/overview'),
    apiClient.get('/shipments'),
    apiClient.get('/analytics/delay-risk'),
    apiClient.get('/analytics/demand-forecast')
  ]);

  return {
    overview: overviewResponse.data.data,
    shipments: shipmentsResponse.data.data,
    delayRisk: delayRiskResponse.data.data,
    demandForecast: forecastResponse.data.data
  };
}

export async function createShipment(payload: ShipmentDraft) {
  const response = await apiClient.post('/shipments', payload);
  return response.data.data;
}