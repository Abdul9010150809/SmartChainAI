import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getCurrentUser, loginUser, registerUser } from '../services/authService';
import { getDemoAccounts, getDemoSession } from '../services/demoService';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const auth = await registerUser(req.body);
  res.status(201).json({ data: auth });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const auth = await loginUser(req.body);
  res.json({ data: auth });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user?.id ?? '');
  res.json({ data: user });
});

export const demo = asyncHandler(async (req: Request, res: Response) => {
  const role = req.body?.role ?? req.query.role;
  const auth = await getDemoSession(role === 'admin' || role === 'viewer' ? role : 'operator');
  res.json({ data: auth });
});

export const demoAccounts = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ data: getDemoAccounts() });
});