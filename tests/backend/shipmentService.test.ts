jest.mock('../../backend/src/models/Shipment', () => ({
  Shipment: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

import { Shipment } from '../../backend/src/models/Shipment';
import { addShipmentEvent, createShipment, updateShipmentStatus } from '../../backend/src/services/shipmentService';

const mockedShipment = Shipment as unknown as {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
};

describe('shipmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a shipment with seeded event history', async () => {
    mockedShipment.create.mockResolvedValue({
      toObject: () => ({
        trackingNumber: 'SC-20001',
        currentLocation: 'Mumbai',
        events: [{ title: 'Shipment created' }]
      })
    });

    const result = await createShipment('owner-1', {
      trackingNumber: 'SC-20001',
      origin: 'Mumbai',
      destination: 'Hamburg',
      carrier: 'BlueRoute Cargo',
      value: 12000
    });

    expect(mockedShipment.create).toHaveBeenCalledWith(expect.objectContaining({
      owner: 'owner-1',
      currentLocation: 'Mumbai',
      trackingNumber: 'SC-20001'
    }));
    expect(result.trackingNumber).toBe('SC-20001');
  });

  it('updates shipment status and appends a status event', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    mockedShipment.findOne.mockResolvedValue({
      status: 'in_transit',
      currentLocation: 'Dubai Hub',
      events: [],
      save
    });

    const result = await updateShipmentStatus('owner-1', 'shipment-1', {
      status: 'delayed',
      currentLocation: 'Jebel Ali Port',
      note: 'Customs hold added six hours of delay.'
    });

    expect(save).toHaveBeenCalled();
    expect(result.status).toBe('delayed');
    expect(result.currentLocation).toBe('Jebel Ali Port');
  });

  it('adds shipment events', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    mockedShipment.findOne.mockResolvedValue({
      events: [],
      save
    });

    const result = await addShipmentEvent('owner-1', 'shipment-1', {
      title: 'Docked',
      message: 'The container has docked at the port.',
      occurredAt: '2026-04-14T08:00:00.000Z'
    });

    expect(save).toHaveBeenCalled();
    expect(result.events).toHaveLength(1);
  });
});
