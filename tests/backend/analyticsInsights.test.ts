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
import { getOperationalInsights } from '../../backend/src/services/analyticsService';

const mockedShipment = Shipment as unknown as {
  find: jest.Mock;
};

function buildQuery(result: unknown) {
  return {
    select: () => ({
      lean: async () => result
    }),
    lean: async () => result
  };
}

describe('analytics operational insights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('summarizes shipment load, carrier mix, and high-risk lanes', async () => {
    mockedShipment.find.mockReturnValue(buildQuery([
      {
        trackingNumber: 'SC-20001',
        status: 'in_transit',
        carrier: 'BlueRoute Cargo',
        value: 12000,
        delayRisk: 0.21,
        currentLocation: 'Mumbai',
        eta: '2026-04-16T10:00:00.000Z',
        createdAt: '2026-04-12T10:00:00.000Z'
      },
      {
        trackingNumber: 'SC-20002',
        status: 'delayed',
        carrier: 'ExpressLink',
        value: 34000,
        delayRisk: 0.88,
        currentLocation: 'Dubai',
        eta: '2026-04-15T10:00:00.000Z',
        createdAt: '2026-04-11T10:00:00.000Z'
      },
      {
        trackingNumber: 'SC-20003',
        status: 'delivered',
        carrier: 'BlueRoute Cargo',
        value: 8000,
        delayRisk: 0.12,
        currentLocation: 'Hamburg',
        eta: '2026-04-14T10:00:00.000Z',
        createdAt: '2026-04-10T10:00:00.000Z'
      }
    ]));

    const insights = await getOperationalInsights('owner-1');

    expect(insights.totalShipments).toBe(3);
    expect(insights.averageValue).toBe(18000);
    expect(insights.backlogByStatus.delayed).toBe(1);
    expect(insights.topCarriers[0]).toMatchObject({
      carrier: 'BlueRoute Cargo',
      count: 2,
      share: 67
    });
    expect(insights.highRiskShipments[0]).toMatchObject({
      trackingNumber: 'SC-20002',
      status: 'delayed'
    });
    expect(insights.attentionItems[0].title).toContain('high-risk shipments');
  });
});
