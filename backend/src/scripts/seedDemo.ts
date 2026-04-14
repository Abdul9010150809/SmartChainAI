import { connectDatabase } from '../config/db';
import { logger } from '../utils/logger';
import { resetDemoData, seedDemoData } from '../services/demoService';

async function main() {
  await connectDatabase();

  const shouldReset = process.argv.includes('--reset');
  await (shouldReset ? resetDemoData() : seedDemoData());

  logger.info('Demo dataset seeded for admin, operator, and viewer accounts');
  process.exit(0);
}

void main().catch((error) => {
  logger.error('Failed to seed demo data', error instanceof Error ? { stack: error.stack } : undefined);
  process.exit(1);
});