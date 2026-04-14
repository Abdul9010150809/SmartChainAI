import request from 'supertest';
import { createApp } from '../../backend/src/app';

describe('backend API', () => {
  const app = createApp();

  it('exposes a health endpoint', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', service: 'backend' });
  });

  it('rejects invalid auth payloads', async () => {
    const response = await request(app).post('/api/auth/register').send({ email: 'invalid' });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });

  it('protects shipment routes', async () => {
    const response = await request(app).get('/api/shipments');
    expect(response.status).toBe(401);
  });
});