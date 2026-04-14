import { Router } from 'express';
import { demo, login, me, register } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { loginSchema, registerSchema } from '../validators/authValidators';

export const authRoutes = Router();

authRoutes.post('/register', validate(registerSchema), register);
authRoutes.post('/login', validate(loginSchema), login);
authRoutes.post('/demo', demo);
authRoutes.get('/me', authMiddleware, me);