import dotenv from 'dotenv';

dotenv.config();

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: readNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/sensechainai',
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  aiServiceUrl: process.env.AI_SERVICE_URL ?? 'http://localhost:8000',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? ''
};