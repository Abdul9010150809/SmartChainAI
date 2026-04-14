import { Shipment } from '../models/Shipment';

function toShipmentRecord<T extends { toObject?: () => unknown }>(shipment: T): any {
  return typeof shipment.toObject === 'function' ? shipment.toObject() : shipment;
}

export async function listShipments(ownerId: string): Promise<any[]> {
  return Shipment.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
}

export async function getShipmentById(ownerId: string, shipmentId: string): Promise<any> {
  const shipment = await Shipment.findOne({ _id: shipmentId, owner: ownerId }).populate('owner', 'name email role').lean();
  if (!shipment) {
    const error = new Error('Shipment not found');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return shipment;
}

export async function createShipment(ownerId: string, input: {
  trackingNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  value: number;
  eta?: string;
  currentLocation?: string;
}): Promise<any> {
  const shipment = await Shipment.create({
    ...input,
    owner: ownerId,
    currentLocation: input.currentLocation ?? input.origin,
    eta: input.eta ?? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    events: [
      {
        title: 'Shipment created',
        message: `Shipment ${input.trackingNumber} is ready for dispatch`,
        occurredAt: new Date()
      }
    ]
  });

  return shipment.toObject();
}

export async function updateShipmentStatus(ownerId: string, shipmentId: string, input: { status: string; currentLocation?: string; note?: string }): Promise<any> {
  const shipment = await Shipment.findOne({ _id: shipmentId, owner: ownerId });
  if (!shipment) {
    const error = new Error('Shipment not found');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  shipment.status = input.status as never;
  if (input.currentLocation) {
    shipment.currentLocation = input.currentLocation;
  }
  if (input.note) {
    shipment.events.push({ title: 'Status update', message: input.note, occurredAt: new Date() });
  }

  await shipment.save();
  return toShipmentRecord(shipment);
}

export async function addShipmentEvent(ownerId: string, shipmentId: string, input: { title: string; message: string; occurredAt: string }): Promise<any> {
  const shipment = await Shipment.findOne({ _id: shipmentId, owner: ownerId });
  if (!shipment) {
    const error = new Error('Shipment not found');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  shipment.events.push({
    title: input.title,
    message: input.message,
    occurredAt: new Date(input.occurredAt)
  });

  await shipment.save();
  return toShipmentRecord(shipment);
}