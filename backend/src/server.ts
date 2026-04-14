import { createApp } from './app';
import { connectDatabase } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap() {
  await connectDatabase();
  const app = createApp();

  app.listen(env.port, () => {
    logger.info(`Backend API running on port ${env.port}`);
  });
}

void bootstrap().catch((error) => {
  logger.error('Failed to start backend', error instanceof Error ? { stack: error.stack } : undefined);
  process.exit(1);
});