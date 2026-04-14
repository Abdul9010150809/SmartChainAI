import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Shipment } from '../models/Shipment';
import { User } from '../models/User';
import { demoShipments } from '../data/demoSeed';

const DEMO_EMAIL = 'demo@sensechainai.ai';
const DEMO_PASSWORD = 'demo-access';

export async function seedDemoShipments(ownerId: string) {
  const shipmentCount = await Shipment.countDocuments({ owner: ownerId });
  if (shipmentCount > 0) {
    return;
  }

  const now = Date.now();
  await Shipment.insertMany(
    demoShipments.map((shipment) => ({
      trackingNumber: shipment.trackingNumber,
      origin: shipment.origin,
      destination: shipment.destination,
      carrier: shipment.carrier,
      status: shipment.status,
      currentLocation: shipment.currentLocation,
      eta: new Date(now + shipment.etaOffsetHours * 60 * 60 * 1000),
      delayRisk: shipment.delayRisk,
      value: shipment.value,
      owner: ownerId,
      events: shipment.events.map((event, index) => ({
        title: event.title,
        message: event.message,
        occurredAt: new Date(now - event.offsetHours * 60 * 60 * 1000 + index * 15 * 60 * 1000)
      }))
    }))
  );
}

export function buildAuthPayload(user: { _id: { toString(): string }; name: string; email: string; role: string }) {
  return {
    token: jwt.sign(
      { sub: user._id.toString(), email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    ),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function getDemoSession() {
  const user = await ensureDemoUser();

  await seedDemoShipments(user._id.toString());
  return buildAuthPayload(user);
}

export async function seedDemoData() {
  const user = await ensureDemoUser();
  const count = await Shipment.countDocuments({ owner: user._id.toString() });
  if (count === 0) {
    await seedDemoShipments(user._id.toString());
  }
  return buildAuthPayload(user);
}

export async function ensureDemoUser() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const existingUser = await User.findOne({ email: DEMO_EMAIL });

  return existingUser ?? User.create({
    name: 'Demo Operator',
    email: DEMO_EMAIL,
    passwordHash,
    role: 'operator'
  });
}

export async function resetDemoData() {
  const existingUser = await User.findOne({ email: DEMO_EMAIL });

  if (existingUser) {
    await Shipment.deleteMany({ owner: existingUser._id.toString() });
    await User.deleteOne({ _id: existingUser._id });
  }

  const user = await ensureDemoUser();
  await seedDemoShipments(user._id.toString());
  return buildAuthPayload(user);
}
