import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validationMiddleware';
import { addEventSchema, createShipmentSchema, updateShipmentStatusSchema } from '../validators/shipmentValidators';
import { addShipmentEventHandler, createShipmentHandler, fetchShipmentById, fetchShipments, updateShipmentStatusHandler } from '../controllers/shipmentController';

export const shipmentRoutes = Router();

shipmentRoutes.use(authMiddleware);
shipmentRoutes.get('/', fetchShipments);
shipmentRoutes.get('/:id', fetchShipmentById);
shipmentRoutes.post('/', requireRole(['admin', 'operator']), validate(createShipmentSchema), createShipmentHandler);
shipmentRoutes.patch('/:id/status', requireRole(['admin', 'operator']), validate(updateShipmentStatusSchema), updateShipmentStatusHandler);
shipmentRoutes.post('/:id/events', requireRole(['admin', 'operator']), validate(addEventSchema), addShipmentEventHandler);