import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { addEventSchema, createShipmentSchema, updateShipmentStatusSchema } from '../validators/shipmentValidators';
import { addShipmentEventHandler, createShipmentHandler, fetchShipmentById, fetchShipments, updateShipmentStatusHandler } from '../controllers/shipmentController';

export const shipmentRoutes = Router();

shipmentRoutes.use(authMiddleware);
shipmentRoutes.get('/', fetchShipments);
shipmentRoutes.get('/:id', fetchShipmentById);
shipmentRoutes.post('/', validate(createShipmentSchema), createShipmentHandler);
shipmentRoutes.patch('/:id/status', validate(updateShipmentStatusSchema), updateShipmentStatusHandler);
shipmentRoutes.post('/:id/events', validate(addEventSchema), addShipmentEventHandler);