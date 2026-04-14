jest.mock('axios', () => {
  const get = jest.fn();
  const create = jest.fn(() => ({ get }));

  return {
    __esModule: true,
    default: {
      create,
      __get: get
    }
  };
});

import axios from 'axios';
import { geocodeAddress } from '../../backend/src/services/locationService';

describe('locationService geocode fallback', () => {
  const mockedAxios = axios as unknown as { __get: jest.Mock };
  const getMock = mockedAxios.__get;

  beforeEach(() => {
    getMock.mockReset();
  });

  it('returns fallback coordinates when google geocode has no result', async () => {
    getMock.mockResolvedValue({ data: { results: [] } });

    const location = await geocodeAddress('London, UK');

    expect(location.formattedAddress).toContain('London');
    expect(location.placeId).toContain('fallback:london');
    expect(location.latitude).toBeCloseTo(51.5074, 4);
    expect(location.longitude).toBeCloseTo(-0.1278, 4);
  });

  it('throws when no google result and no fallback location exists', async () => {
    getMock.mockResolvedValue({ data: { results: [] } });

    await expect(geocodeAddress('Unknown Polar Research Outpost ZX-991')).rejects.toMatchObject({
      statusCode: 404
    });
  });
});
