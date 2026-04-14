jest.mock('../../backend/src/models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn()
  }
}));

jest.mock('../../backend/src/models/Shipment', () => ({
  Shipment: {
    countDocuments: jest.fn(),
    insertMany: jest.fn(),
    deleteMany: jest.fn()
  }
}));

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(() => Promise.resolve('hashed-password'))
  }
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(() => 'demo-token')
  }
}));

import bcrypt from 'bcryptjs';
import { Shipment } from '../../backend/src/models/Shipment';
import { User } from '../../backend/src/models/User';
import { getDemoAccounts, getDemoSession, seedDemoData } from '../../backend/src/services/demoService';

const mockedUser = User as unknown as {
  findOne: jest.Mock;
  create: jest.Mock;
  deleteOne: jest.Mock;
};

const mockedShipment = Shipment as unknown as {
  countDocuments: jest.Mock;
  insertMany: jest.Mock;
  deleteMany: jest.Mock;
};

const mockedBcrypt = bcrypt as unknown as {
  hash: jest.Mock;
};

describe('demo accounts connectivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUser.findOne.mockResolvedValue(null);
    mockedUser.create.mockImplementation(async (input) => ({
      _id: { toString: () => `${input.role}-id` },
      ...input
    }));
    mockedShipment.countDocuments.mockResolvedValue(0);
    mockedShipment.insertMany.mockResolvedValue([]);
    mockedShipment.deleteMany.mockResolvedValue(undefined);
    mockedUser.deleteOne.mockResolvedValue(undefined);
    mockedBcrypt.hash.mockResolvedValue('hashed-password');
  });

  it('exposes three demo accounts for admin, operator, and viewer', () => {
    const accounts = getDemoAccounts();

    expect(accounts).toHaveLength(3);
    expect(accounts.map((account) => account.role)).toEqual(['admin', 'operator', 'viewer']);
  });

  it('returns a role-matched demo session for each account type', async () => {
    const adminSession = await getDemoSession('admin');
    const operatorSession = await getDemoSession('operator');
    const viewerSession = await getDemoSession('viewer');

    expect(adminSession.user.email).toBe('admin@smartchainai.ai');
    expect(operatorSession.user.email).toBe('operator@smartchainai.ai');
    expect(viewerSession.user.email).toBe('viewer@smartchainai.ai');
    expect(adminSession.user.role).toBe('admin');
    expect(operatorSession.user.role).toBe('operator');
    expect(viewerSession.user.role).toBe('viewer');
  });

  it('seeds all demo accounts without error', async () => {
    await expect(seedDemoData()).resolves.toBeUndefined();

    expect(mockedUser.create).toHaveBeenCalledTimes(3);
    expect(mockedUser.create.mock.calls.map((call) => call[0].role)).toEqual(
      expect.arrayContaining(['admin', 'operator', 'viewer'])
    );
  });
});
