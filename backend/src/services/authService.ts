import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';

export async function registerUser(input: { name: string; email: string; password: string; role: 'admin' | 'operator' | 'viewer' }) {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    const error = new Error('User already exists');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({ ...input, email: input.email.toLowerCase(), passwordHash });
  return buildAuthResponse(user);
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    const error = new Error('Invalid credentials');
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    const error = new Error('Invalid credentials');
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  return buildAuthResponse(user);
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).select('name email role createdAt');
  if (!user) {
    const error = new Error('User not found');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return user;
}

function buildAuthResponse(user: { _id: { toString(): string }; email: string; role: string; name: string }) {
  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}