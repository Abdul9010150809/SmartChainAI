import { MongoMemoryServer } from 'mongodb-memory-server';

const mongo = await MongoMemoryServer.create({
  instance: {
    ip: '127.0.0.1',
    port: 27017,
    dbName: 'smartchainai'
  }
});

console.log(`MongoDB Memory Server started at ${mongo.getUri()}`);
console.log('Press Ctrl+C to stop local DB');

process.on('SIGINT', async () => {
  await mongo.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongo.stop();
  process.exit(0);
});

setInterval(() => {}, 1 << 30);
