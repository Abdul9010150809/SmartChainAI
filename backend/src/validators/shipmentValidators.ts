import Joi from 'joi';

export const createShipmentSchema = Joi.object({
  trackingNumber: Joi.string().trim().min(4).max(64).required(),
  origin: Joi.string().trim().min(2).max(120).required(),
  destination: Joi.string().trim().min(2).max(120).required(),
  carrier: Joi.string().trim().min(2).max(120).required(),
  value: Joi.number().min(0).required(),
  eta: Joi.date().iso().optional(),
  currentLocation: Joi.string().trim().max(120).optional()
});

export const updateShipmentStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_transit', 'delivered', 'delayed', 'cancelled').required(),
  currentLocation: Joi.string().trim().min(2).max(120).optional(),
  note: Joi.string().trim().max(500).optional()
});

export const addEventSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120).required(),
  message: Joi.string().trim().min(2).max(500).required(),
  occurredAt: Joi.date().iso().required()
});