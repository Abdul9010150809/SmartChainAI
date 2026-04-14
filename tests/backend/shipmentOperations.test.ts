jest.mock('../../backend/src/models/Shipment', () => ({
  Shipment: {
    find: jest.fn(),
    findOne: jest.fn()
  }
}));

import { Shipment } from '../../backend/src/models/Shipment';
import { getShipmentById, listShipments } from '../../backend/src/services/shipmentService';

const mockedShipment = Shipment as unknown as {
  find: jest.Mock;
  findOne: jest.Mock;
};

function createListQuery(result: unknown) {
  return {
    sort: () => ({
      lean: async () => result
    })
  };
}

function createFindOneQuery(result: unknown) {
  return {
    populate: () => ({
      lean: async () => result
    })
  };
}

describe('shipment operations service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists shipments for an owner in reverse chronological order', async () => {
    mockedShipment.find.mockReturnValue(createListQuery([
      { trackingNumber: 'SC-10002', createdAt: '2026-04-14T10:00:00.000Z' },
      { trackingNumber: 'SC-10001', createdAt: '2026-04-13T10:00:00.000Z' }
    ]));

    const shipments = await listShipments('owner-1');

    expect(mockedShipment.find).toHaveBeenCalledWith({ owner: 'owner-1' });
    expect(shipments).toHaveLength(2);
    expect(shipments[0].trackingNumber).toBe('SC-10002');
  });

  it('returns a shipment by id when the record exists', async () => {
    mockedShipment.findOne.mockReturnValue(createFindOneQuery({
      trackingNumber: 'SC-10001',
      status: 'in_transit',
      owner: { name: 'Demo Operator' }
    }));

    const shipment = await getShipmentById('owner-1', 'shipment-1');

    expect(mockedShipment.findOne).toHaveBeenCalledWith({ _id: 'shipment-1', owner: 'owner-1' });
    expect(shipment.trackingNumber).toBe('SC-10001');
  });

  it('throws when a shipment cannot be found', async () => {
    mockedShipment.findOne.mockReturnValue(createFindOneQuery(null));

    await expect(getShipmentById('owner-1', 'missing')).rejects.toMatchObject({
      message: 'Shipment not found',
      statusCode: 404
    });
  });
});
