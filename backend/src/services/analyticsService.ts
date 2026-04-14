import { Shipment } from '../models/Shipment';
import { forecastDemand, predictDelay } from './aiClient';

function buildDelayFallback(trackingNumber: string, status: string, delayRisk: number) {
  return {
    label: trackingNumber,
    probability: Math.min(0.95, Math.max(0.05, delayRisk || (status === 'delayed' ? 0.82 : 0.2))),
    reason: status === 'delayed'
      ? 'Shipment is already flagged as delayed.'
      : 'Using local scoring because the AI service is temporarily unavailable.'
  };
}

function buildDemandFallback(series: number[]) {
  const values = series.length ? series : [8, 11, 13, 10, 12];
  const window = values.slice(-Math.min(5, values.length));
  const baseline = window.reduce((total, value) => total + value, 0) / window.length;
  return Array.from({ length: 5 }, (_, index) => ({
    period: `Period ${index + 1}`,
    expectedOrders: Math.max(0, Math.round(baseline + index))
  }));
}

export async function getOverview(ownerId: string) {
  const shipments = await Shipment.find({ owner: ownerId }).select('status createdAt updatedAt').lean();
  const activeShipments = shipments.filter((shipment) => ['pending', 'in_transit'].includes(shipment.status)).length;
  const deliveredShipments = shipments.filter((shipment) => shipment.status === 'delivered').length;
  const delayedShipments = shipments.filter((shipment) => shipment.status === 'delayed').length;
  const transitHours = shipments
    .filter((shipment) => shipment.createdAt && shipment.updatedAt)
    .map((shipment) => (new Date(shipment.updatedAt).getTime() - new Date(shipment.createdAt).getTime()) / (1000 * 60 * 60));

  const averageTransitHours = transitHours.length
    ? Math.round((transitHours.reduce((total, value) => total + value, 0) / transitHours.length) * 10) / 10
    : 0;
  const onTimeRate = shipments.length ? deliveredShipments / shipments.length : 0;

  return {
    activeShipments,
    deliveredShipments,
    delayedShipments,
    averageTransitHours,
    onTimeRate
  };
}

export async function getDelayRisk(ownerId: string) {
  const shipments = await Shipment.find({ owner: ownerId }).sort({ delayRisk: -1 }).limit(5).lean();

  try {
    return await Promise.all(
      shipments.map(async (shipment) => {
        const aiScore = await predictDelay({
          distanceKm: Math.max(120, shipment.value / 10),
          weatherSeverity: shipment.status === 'delayed' ? 0.8 : 0.25,
          carrierReliability: shipment.carrier.toLowerCase().includes('express') ? 0.85 : 0.65,
          dwellHours: shipment.status === 'in_transit' ? 5 : 2,
          loadFactor: shipment.value > 50000 ? 0.9 : 0.55
        });

        return {
          label: shipment.trackingNumber,
          probability: aiScore.probability,
          reason: aiScore.reason
        };
      })
    );
  } catch {
    return shipments.map((shipment) => buildDelayFallback(shipment.trackingNumber, shipment.status, shipment.delayRisk));
  }
}

export async function getDemandForecast(ownerId: string) {
  const shipments = await Shipment.find({ owner: ownerId }).select('createdAt').sort({ createdAt: 1 }).lean();
  const countsByDay = new Map<string, number>();

  for (const shipment of shipments) {
    const day = new Date(shipment.createdAt).toISOString().slice(0, 10);
    countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1);
  }

  const series = Array.from(countsByDay.values());
  try {
    const forecast = await forecastDemand({ series: series.length ? series : [8, 11, 13, 10, 12], horizon: 5 });
    return forecast.periods;
  } catch {
    return buildDemandFallback(series);
  }
}