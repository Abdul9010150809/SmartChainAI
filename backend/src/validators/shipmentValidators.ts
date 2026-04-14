import Joi from 'joi';

export const createShipmentSchema = Joi.object({
  trackingNumber: Joi.string().trim().pattern(/^SC-[A-Z0-9-]{4,64}$/).required().messages({
    'string.pattern.base': 'trackingNumber must start with SC- and include only uppercase letters, numbers, or hyphens',
    'any.required': 'trackingNumber is required'
  }),
  origin: Joi.string().trim().min(2).max(120).required().messages({
    'any.required': 'origin is required'
  }),
  destination: Joi.string().trim().min(2).max(120).required().messages({
    'any.required': 'destination is required'
  }),
  carrier: Joi.string().trim().min(2).max(120).required().messages({
    'any.required': 'carrier is required'
  }),
  value: Joi.number().min(1).required().messages({
    'number.min': 'value must be greater than 0',
    'any.required': 'value is required'
  }),
  eta: Joi.date().iso().optional(),
  currentLocation: Joi.string().trim().max(120).optional()
}).custom((value, helpers) => {
  const origin = String(value.origin ?? '').toUpperCase();
  const destination = String(value.destination ?? '').toUpperCase();
  const indiaPattern = /(?:,\s*IN\b|\bINDIA\b)/;

  if (!indiaPattern.test(origin) && !indiaPattern.test(destination)) {
    return helpers.error('any.custom', {
      message: 'India shipping rule: either origin or destination must be in India (use ", IN" or "India")'
    });
  }

  return value;
}).messages({
  'any.custom': '{{#message}}'
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