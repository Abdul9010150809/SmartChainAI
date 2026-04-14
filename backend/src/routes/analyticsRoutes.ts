import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { delayRisk, demandForecast, operations, overview } from '../controllers/analyticsController';

export const analyticsRoutes = Router();

analyticsRoutes.use(authMiddleware);
analyticsRoutes.get('/overview', overview);
analyticsRoutes.get('/delay-risk', delayRisk);
analyticsRoutes.get('/demand-forecast', demandForecast);
analyticsRoutes.get('/operations', operations);