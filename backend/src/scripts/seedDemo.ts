import { connectDatabase } from '../config/db';
import { logger } from '../utils/logger';
import { resetDemoData, seedDemoData } from '../services/demoService';

async function main() {
  await connectDatabase();

  const shouldReset = process.argv.includes('--reset');
  const session = shouldReset ? await resetDemoData() : await seedDemoData();

  logger.info(`Demo dataset seeded for ${session.user.email}`);
  process.exit(0);
}

void main().catch((error) => {
  logger.error('Failed to seed demo data', error instanceof Error ? { stack: error.stack } : undefined);
  process.exit(1);
});