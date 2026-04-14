import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Shipment } from '../models/Shipment';
import { User } from '../models/User';
import { demoShipments } from '../data/demoSeed';

export type DemoRole = 'admin' | 'operator' | 'viewer';

const DEMO_TRACKING_PREFIX: Record<DemoRole, string> = {
  admin: 'ADM',
  operator: 'OPR',
  viewer: 'VWR'
};

const DEMO_ACCOUNTS: Array<{
  role: DemoRole;
  name: string;
  email: string;
  password: string;
}> = [
  { role: 'admin', name: 'Demo Admin', email: 'admin@smartchainai.ai', password: 'demo-admin' },
  { role: 'operator', name: 'Demo Operator', email: 'operator@smartchainai.ai', password: 'demo-operator' },
  { role: 'viewer', name: 'Demo Viewer', email: 'viewer@smartchainai.ai', password: 'demo-viewer' }
];

function buildDemoTrackingNumber(baseTrackingNumber: string, role: DemoRole) {
  const suffix = baseTrackingNumber.replace(/^SC-/, '');
  return `SC-${DEMO_TRACKING_PREFIX[role]}-${suffix}`;
}

function isIndiaRoute(origin: string, destination: string) {
  const route = `${origin} ${destination}`.toLowerCase();
  return route.includes('india') || route.includes(', in');
}

export async function seedDemoShipments(ownerId: string, role: DemoRole) {
  const existingShipments = await Shipment.find({ owner: ownerId }).select('origin destination trackingNumber').lean();
  const hasOutOfIndiaRoute = existingShipments.some((shipment) => !isIndiaRoute(shipment.origin, shipment.destination));

  if (existingShipments.length > 0 && !hasOutOfIndiaRoute) {
    return;
  }

  if (existingShipments.length > 0) {
    await Shipment.deleteMany({ owner: ownerId });
  }

  const now = Date.now();
  await Shipment.insertMany(
    demoShipments.map((shipment) => ({
      trackingNumber: buildDemoTrackingNumber(shipment.trackingNumber, role),
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

export async function getDemoSession(role: DemoRole = 'operator') {
  const user = await ensureDemoUser(role);

  await seedDemoShipments(user._id.toString(), role);
  return buildAuthPayload(user);
}

export async function seedDemoData() {
  for (const account of DEMO_ACCOUNTS) {
    const user = await ensureDemoUser(account.role);
    const count = await Shipment.countDocuments({ owner: user._id.toString() });
    if (count === 0) {
      await seedDemoShipments(user._id.toString(), account.role);
    }
  }
}

export async function ensureDemoUser(role: DemoRole = 'operator') {
  const account = DEMO_ACCOUNTS.find((entry) => entry.role === role) ?? DEMO_ACCOUNTS[1];
  const passwordHash = await bcrypt.hash(account.password, 12);
  const existingUser = await User.findOne({ email: account.email });

  return existingUser ?? User.create({
    name: account.name,
    email: account.email,
    passwordHash,
    role: account.role
  });
}

export async function resetDemoData() {
  for (const account of DEMO_ACCOUNTS) {
    const existingUser = await User.findOne({ email: account.email });

    if (existingUser) {
      await Shipment.deleteMany({ owner: existingUser._id.toString() });
      await User.deleteOne({ _id: existingUser._id });
    }
  }

  const user = await ensureDemoUser('operator');
  await seedDemoShipments(user._id.toString(), 'operator');
  return buildAuthPayload(user);
}

export function getDemoAccounts() {
  return DEMO_ACCOUNTS.map(({ role, name, email, password }) => ({ role, name, email, password }));
}
