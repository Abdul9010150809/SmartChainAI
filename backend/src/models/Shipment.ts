import { Schema, model, Types } from 'mongoose';

const trackingEventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    occurredAt: { type: Date, required: true }
  },
  { _id: true }
);

const shipmentSchema = new Schema(
  {
    trackingNumber: { type: String, required: true, unique: true, trim: true, index: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    carrier: { type: String, required: true, trim: true, index: true },
    status: { type: String, enum: ['pending', 'in_transit', 'delivered', 'delayed', 'cancelled'], default: 'pending', index: true },
    currentLocation: { type: String, required: true, trim: true },
    eta: { type: Date, required: true, index: true },
    delayRisk: { type: Number, default: 0, min: 0, max: 1, index: true },
    value: { type: Number, required: true, min: 0 },
    owner: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    events: { type: [trackingEventSchema], default: [] }
  },
  { timestamps: true }
);

shipmentSchema.index({ status: 1, eta: 1 });
shipmentSchema.index({ owner: 1, createdAt: -1 });

export const Shipment = model('Shipment', shipmentSchema);