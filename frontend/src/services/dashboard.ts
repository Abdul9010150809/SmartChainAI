import { apiClient } from './api';
import type { DashboardSnapshot, ShipmentDraft } from '../types';

type ApiShipment = {
  id?: string;
  _id?: string;
  events?: Array<{ id?: string; _id?: string; [key: string]: unknown }>;
  [key: string]: unknown;
};

function normalizeShipmentId(shipment: ApiShipment) {
  return String(shipment.id ?? shipment._id ?? '');
}

function normalizeEventId(event: { id?: string; _id?: string; [key: string]: unknown }, index: number) {
  return String(event.id ?? event._id ?? `event-${index}`);
}

function normalizeShipmentRecord(shipment: ApiShipment) {
  const events = Array.isArray(shipment.events)
    ? shipment.events.map((event, index) => ({
      ...event,
      id: normalizeEventId(event, index)
    }))
    : [];

  return {
    ...shipment,
    id: normalizeShipmentId(shipment),
    events
  };
}

export async function fetchDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [overviewResponse, shipmentsResponse, delayRiskResponse, forecastResponse] = await Promise.all([
    apiClient.get('/analytics/overview'),
    apiClient.get('/shipments'),
    apiClient.get('/analytics/delay-risk'),
    apiClient.get('/analytics/demand-forecast')
  ]);

  return {
    overview: overviewResponse.data.data,
    shipments: Array.isArray(shipmentsResponse.data.data)
      ? shipmentsResponse.data.data.map((shipment: ApiShipment) => normalizeShipmentRecord(shipment))
      : [],
    delayRisk: delayRiskResponse.data.data,
    demandForecast: forecastResponse.data.data
  };
}

export async function createShipment(payload: ShipmentDraft) {
  const response = await apiClient.post('/shipments', payload);
  return response.data.data;
}