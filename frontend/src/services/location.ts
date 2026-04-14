import { apiClient } from './api';
import type { ShipmentLocationSnapshot } from '../types';

export async function fetchShipmentLocation(shipmentId: string): Promise<ShipmentLocationSnapshot> {
  const response = await apiClient.get(`/location/shipments/${shipmentId}`);
  return response.data.data;
}
