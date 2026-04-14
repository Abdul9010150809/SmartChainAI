import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { addShipmentEvent, createShipment, getShipmentById, listShipments, updateShipmentStatus } from '../services/shipmentService';

export const fetchShipments = asyncHandler(async (req: Request, res: Response) => {
  const shipments = await listShipments(req.user?.id ?? '');
  res.json({ data: shipments });
});

export const fetchShipmentById = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await getShipmentById(req.user?.id ?? '', String(req.params.id));
  res.json({ data: shipment });
});

export const createShipmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await createShipment(req.user?.id ?? '', req.body);
  res.status(201).json({ data: shipment });
});

export const updateShipmentStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await updateShipmentStatus(req.user?.id ?? '', String(req.params.id), req.body);
  res.json({ data: shipment });
});

export const addShipmentEventHandler = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await addShipmentEvent(req.user?.id ?? '', String(req.params.id), req.body);
  res.status(201).json({ data: shipment });
});