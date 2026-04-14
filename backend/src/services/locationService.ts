import axios from 'axios';
import { env } from '../config/env';

const googleMapsClient = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api',
  timeout: 10000
});

export interface GeocodedLocation {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

const fallbackLocations: Record<string, { latitude: number; longitude: number; formattedAddress: string }> = {
  'mumbai': { latitude: 19.076, longitude: 72.8777, formattedAddress: 'Mumbai, Maharashtra, India' },
  'pune': { latitude: 18.5204, longitude: 73.8567, formattedAddress: 'Pune, Maharashtra, India' },
  'chennai': { latitude: 13.0827, longitude: 80.2707, formattedAddress: 'Chennai, Tamil Nadu, India' },
  'hyderabad': { latitude: 17.385, longitude: 78.4867, formattedAddress: 'Hyderabad, Telangana, India' },
  'delhi': { latitude: 28.6139, longitude: 77.209, formattedAddress: 'Delhi, India' },
  'berlin': { latitude: 52.52, longitude: 13.405, formattedAddress: 'Berlin, Germany' },
  'london': { latitude: 51.5074, longitude: -0.1278, formattedAddress: 'London, United Kingdom' },
  'heathrow': { latitude: 51.47, longitude: -0.4543, formattedAddress: 'Heathrow Airport, United Kingdom' },
  'dubai': { latitude: 25.2048, longitude: 55.2708, formattedAddress: 'Dubai, United Arab Emirates' },
  'jebel ali': { latitude: 24.985, longitude: 55.065, formattedAddress: 'Jebel Ali, Dubai, United Arab Emirates' },
  'istanbul': { latitude: 41.0082, longitude: 28.9784, formattedAddress: 'Istanbul, Turkiye' },
  'singapore': { latitude: 1.3521, longitude: 103.8198, formattedAddress: 'Singapore' },
  'paris': { latitude: 48.8566, longitude: 2.3522, formattedAddress: 'Paris, France' }
};

function fallbackGeocode(address: string): GeocodedLocation | null {
  const normalized = address.toLowerCase();
  const match = Object.entries(fallbackLocations).find(([keyword]) => normalized.includes(keyword));

  if (!match) {
    return null;
  }

  const [keyword, fallback] = match;
  return {
    formattedAddress: fallback.formattedAddress,
    latitude: fallback.latitude,
    longitude: fallback.longitude,
    placeId: `fallback:${keyword.replace(/\s+/g, '-')}`
  };
}

function ensureMapsKey() {
  if (!env.googleMapsApiKey) {
    const error = new Error('Google Maps API key is not configured');
    (error as Error & { statusCode?: number }).statusCode = 503;
    throw error;
  }

  return env.googleMapsApiKey;
}

export async function geocodeAddress(address: string): Promise<GeocodedLocation> {
  try {
    const apiKey = ensureMapsKey();
    const response = await googleMapsClient.get('/geocode/json', {
      params: {
        address,
        key: apiKey
      }
    });

    const firstResult = response.data?.results?.[0];
    if (!firstResult) {
      throw new Error(`No geocoding result found for address: ${address}`);
    }

    return {
      formattedAddress: firstResult.formatted_address,
      latitude: firstResult.geometry.location.lat,
      longitude: firstResult.geometry.location.lng,
      placeId: firstResult.place_id
    };
  } catch (error) {
    const fallback = fallbackGeocode(address);
    if (fallback) {
      return fallback;
    }

    const nextError = error instanceof Error ? error : new Error(`No geocoding result found for address: ${address}`);
    (nextError as Error & { statusCode?: number }).statusCode = 404;
    throw nextError;
  };
}

export function buildStaticMapUrl(latitude: number, longitude: number) {
  const apiKey = ensureMapsKey();
  const marker = `${latitude},${longitude}`;

  return `https://maps.googleapis.com/maps/api/staticmap?center=${marker}&zoom=9&size=1000x420&scale=2&maptype=roadmap&markers=color:0x0f766e|label:S|${marker}&key=${apiKey}`;
}
