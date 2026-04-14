export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';

export interface ShipmentEvent {
  id: string;
  title: string;
  message: string;
  occurredAt: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  currentLocation: string;
  eta: string;
  delayRisk: number;
  value: number;
  events: ShipmentEvent[];
}

export interface OverviewMetrics {
  activeShipments: number;
  deliveredShipments: number;
  delayedShipments: number;
  averageTransitHours: number;
  onTimeRate: number;
}

export interface DelayRiskItem {
  label: string;
  probability: number;
  reason: string;
}

export interface DemandForecastItem {
  period: string;
  expectedOrders: number;
}

export interface DashboardSnapshot {
  overview: OverviewMetrics;
  shipments: Shipment[];
  delayRisk: DelayRiskItem[];
  demandForecast: DemandForecastItem[];
}

export interface ShipmentDraft {
  trackingNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  value: number;
}

export interface GeocodedAddress {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export interface ShipmentLocationSnapshot {
  trackingNumber: string;
  currentLocation: GeocodedAddress & {
    staticMapUrl: string;
  };
  origin: GeocodedAddress;
  destination: GeocodedAddress;
  mapsDirectionsLink: string;
}
