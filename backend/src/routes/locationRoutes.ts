import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { geocodeQuerySchema } from '../validators/locationValidators';
import { geocode, shipmentLocation } from '../controllers/locationController';

export const locationRoutes = Router();

locationRoutes.use(authMiddleware);
locationRoutes.get('/geocode', validate(geocodeQuerySchema, 'query'), geocode);
locationRoutes.get('/shipments/:id', shipmentLocation);
