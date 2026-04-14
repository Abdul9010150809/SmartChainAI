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

export async function predictDelay(payload: DelayPredictionInput) {
  const response = await aiClient.post('/predict/delay', payload);
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