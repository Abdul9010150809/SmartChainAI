import axios from 'axios';
import { env } from '../config/env';

const aiClient = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 10000
});

export interface DelayPredictionInput {
  distanceKm: number;
  weatherSeverity: number;
  carrierReliability: number;
  dwellHours: number;
  loadFactor: number;
  customsDelayHours?: number;
  vehicleAgeYears?: number;
}

export interface DelayPredictionResult {
  probability: number;
  expected_delay_hours: number;
  risk_level: string;
  reason: string;
}

export interface DemandForecastInput {
  series: number[];
  horizon: number;
}

export interface RouteMapPoint {
  latitude: number;
  longitude: number;
  label: string;
}

export interface RouteMapInput {
  origin: RouteMapPoint;
  current: RouteMapPoint;
  destination: RouteMapPoint;
  trackingNumber: string;
}

export async function predictDelay(payload: DelayPredictionInput): Promise<DelayPredictionResult> {
  const response = await aiClient.post('/predict/delay', {
    distance_km: payload.distanceKm,
    weather_severity: payload.weatherSeverity,
    carrier_reliability: payload.carrierReliability,
    dwell_hours: payload.dwellHours,
    load_factor: payload.loadFactor,
    customs_delay_hours: payload.customsDelayHours ?? 0,
    vehicle_age_years: payload.vehicleAgeYears ?? 0
  });
  return response.data.data;
}

export async function forecastDemand(payload: DemandForecastInput) {
  const response = await aiClient.post('/forecast/demand', payload);
  return response.data.data;
}

export async function renderRouteMap(payload: RouteMapInput): Promise<{ html: string }> {
  const response = await aiClient.post('/maps/route', {
    origin: payload.origin,
    current: payload.current,
    destination: payload.destination,
    tracking_number: payload.trackingNumber
  });

  return response.data.data;
}