import Joi from 'joi';

export const geocodeQuerySchema = Joi.object({
  address: Joi.string().trim().min(3).max(200).required()
});
