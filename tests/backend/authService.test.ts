jest.mock('../../backend/src/models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn()
  }
}));

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    compare: jest.fn()
  }
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(() => 'signed-demo-token')
  }
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../backend/src/models/User';
import { loginUser, registerUser } from '../../backend/src/services/authService';

const mockedUser = User as unknown as {
  findOne: jest.Mock;
  create: jest.Mock;
  findById: jest.Mock;
};

const mockedBcrypt = bcrypt as unknown as {
  hash: jest.Mock;
  compare: jest.Mock;
};

const mockedJwt = jwt as unknown as {
  sign: jest.Mock;
};

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user and issues a token', async () => {
    mockedUser.findOne.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue('hashed-password');
    mockedUser.create.mockResolvedValue({
      _id: { toString: () => 'user-1' },
      name: 'Ava Operator',
      email: 'ava@sensechain.ai',
      role: 'operator'
    });

    const result = await registerUser({
      name: 'Ava Operator',
      email: 'Ava@SenseChain.AI',
      password: 'securepass123',
      role: 'operator'
    });

    expect(mockedUser.create).toHaveBeenCalledWith({
      name: 'Ava Operator',
      email: 'ava@sensechain.ai',
      password: 'securepass123',
      passwordHash: 'hashed-password',
      role: 'operator'
    });
    expect(mockedJwt.sign).toHaveBeenCalled();
    expect(result.user.email).toBe('ava@sensechain.ai');
    expect(result.token).toBe('signed-demo-token');
  });

  it('rejects invalid login credentials', async () => {
    mockedUser.findOne.mockResolvedValue({
      passwordHash: 'hashed-password'
    });
    mockedBcrypt.compare.mockResolvedValue(false);

    await expect(loginUser({ email: 'ops@sensechain.ai', password: 'wrongpass' })).rejects.toMatchObject({
      message: 'Invalid credentials'
    });
  });
});
