import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getDemandForecast, getDelayRisk, getOperationalInsights, getOverview, getShipmentDelayPrediction } from '../services/analyticsService';

export const overview = asyncHandler(async (req: Request, res: Response) => {
  const data = await getOverview(req.user?.id ?? '');
  res.json({ data });
});

export const delayRisk = asyncHandler(async (req: Request, res: Response) => {
  const data = await getDelayRisk(req.user?.id ?? '');
  res.json({ data });
});

export const demandForecast = asyncHandler(async (req: Request, res: Response) => {
  const data = await getDemandForecast(req.user?.id ?? '');
  res.json({ data });
});

export const operations = asyncHandler(async (req: Request, res: Response) => {
  const data = await getOperationalInsights(req.user?.id ?? '');
  res.json({ data });
});

export const shipmentDelayPrediction = asyncHandler(async (req: Request, res: Response) => {
  const data = await getShipmentDelayPrediction(req.user?.id ?? '', String(req.params.id));
  res.json({ data });
});