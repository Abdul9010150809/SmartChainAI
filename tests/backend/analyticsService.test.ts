jest.mock('../../backend/src/models/Shipment', () => ({
  Shipment: {
    find: jest.fn()
  }
}));

jest.mock('../../backend/src/services/aiClient', () => ({
  predictDelay: jest.fn(),
  forecastDemand: jest.fn()
}));

import { Shipment } from '../../backend/src/models/Shipment';
import { forecastDemand, predictDelay } from '../../backend/src/services/aiClient';
import { getDemandForecast, getDelayRisk, getOverview } from '../../backend/src/services/analyticsService';

const mockedShipment = Shipment as unknown as {
  find: jest.Mock;
};

const mockedPredictDelay = predictDelay as unknown as jest.Mock;
const mockedForecastDemand = forecastDemand as unknown as jest.Mock;

function makeQuery(result: unknown) {
  return {
    select: () => ({
      sort: () => ({
        limit: () => ({
          lean: async () => result
        }),
        lean: async () => result
      }),
      lean: async () => result
    }),
    sort: () => ({
      limit: () => ({
        lean: async () => result
      }),
      lean: async () => result
    }),
    lean: async () => result
  };
}

describe('analyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates overview metrics from shipments', async () => {
    mockedShipment.find.mockReturnValue(makeQuery([
      { status: 'in_transit', createdAt: '2026-04-13T10:00:00.000Z', updatedAt: '2026-04-14T10:00:00.000Z' },
      { status: 'delivered', createdAt: '2026-04-10T10:00:00.000Z', updatedAt: '2026-04-12T14:00:00.000Z' },
      { status: 'delayed', createdAt: '2026-04-11T10:00:00.000Z', updatedAt: '2026-04-12T12:00:00.000Z' }
    ]));

    const overview = await getOverview('owner-1');

    expect(overview).toMatchObject({
      activeShipments: 1,
      deliveredShipments: 1,
      delayedShipments: 1
    });
    expect(overview.onTimeRate).toBeCloseTo(1 / 3, 2);
  });

  it('falls back to local delay scoring when AI prediction fails', async () => {
    mockedShipment.find.mockReturnValue(makeQuery([
      {
        trackingNumber: 'SC-10003',
        status: 'delayed',
        carrier: 'ExpressLink',
        value: 65500,
        delayRisk: 0.79
      },
      {
        trackingNumber: 'SC-10001',
        status: 'in_transit',
        carrier: 'NorthStar Freight',
        value: 42000,
        delayRisk: 0.22
      }
    ]));
    mockedPredictDelay.mockRejectedValue(new Error('AI service unavailable'));

    const results = await getDelayRisk('owner-1');

    expect(results[0].label).toBe('SC-10003');
    expect(results[0].reason).toContain('delayed');
    expect(results[1].probability).toBeGreaterThan(0);
  });

  it('falls back to a local forecast when AI demand prediction fails', async () => {
    mockedShipment.find.mockReturnValue(makeQuery([
      { createdAt: '2026-04-10T10:00:00.000Z' },
      { createdAt: '2026-04-10T14:00:00.000Z' },
      { createdAt: '2026-04-11T10:00:00.000Z' }
    ]));
    mockedForecastDemand.mockRejectedValue(new Error('forecast down'));

    const forecast = await getDemandForecast('owner-1');

    expect(forecast).toHaveLength(5);
    expect(forecast[0]).toHaveProperty('period', 'Period 1');
  });
});
