import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { shipmentRoutes } from './shipmentRoutes';
import { analyticsRoutes } from './analyticsRoutes';
import { locationRoutes } from './locationRoutes';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

routes.use('/auth', authRoutes);
routes.use('/shipments', shipmentRoutes);
routes.use('/analytics', analyticsRoutes);
routes.use('/location', locationRoutes);