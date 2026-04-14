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
  'bengaluru': { latitude: 12.9716, longitude: 77.5946, formattedAddress: 'Bengaluru, Karnataka, India' },
  'bangalore': { latitude: 12.9716, longitude: 77.5946, formattedAddress: 'Bengaluru, Karnataka, India' },
  'chennai': { latitude: 13.0827, longitude: 80.2707, formattedAddress: 'Chennai, Tamil Nadu, India' },
  'hyderabad': { latitude: 17.385, longitude: 78.4867, formattedAddress: 'Hyderabad, Telangana, India' },
  'delhi': { latitude: 28.6139, longitude: 77.209, formattedAddress: 'Delhi, India' },
  'kolkata': { latitude: 22.5726, longitude: 88.3639, formattedAddress: 'Kolkata, West Bengal, India' },
  'ahmedabad': { latitude: 23.0225, longitude: 72.5714, formattedAddress: 'Ahmedabad, Gujarat, India' },
  'jaipur': { latitude: 26.9124, longitude: 75.7873, formattedAddress: 'Jaipur, Rajasthan, India' },
  'kochi': { latitude: 9.9312, longitude: 76.2673, formattedAddress: 'Kochi, Kerala, India' },
  'nagpur': { latitude: 21.1458, longitude: 79.0882, formattedAddress: 'Nagpur, Maharashtra, India' },
  'vijayawada': { latitude: 16.5062, longitude: 80.648, formattedAddress: 'Vijayawada, Andhra Pradesh, India' },
  'chandigarh': { latitude: 30.7333, longitude: 76.7794, formattedAddress: 'Chandigarh, India' },
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

function buildDeterministicFallback(address: string): GeocodedLocation {
  const normalized = address.trim() || 'Unknown location';
  let hash = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }

  const latOffset = ((hash % 1200) / 1000) - 0.6;
  const lngOffset = ((((hash / 1200) | 0) % 1200) / 1000) - 0.6;
  const latitude = 20.5937 + latOffset;
  const longitude = 78.9629 + lngOffset;
  const slug = normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'unknown';

  return {
    formattedAddress: normalized,
    latitude,
    longitude,
    placeId: `fallback:auto:${slug}`
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

function normalizeAddressForIndia(address: string) {
  return address.replace(/,\s*IN\b/gi, ', India').trim();
}

export async function geocodeAddress(address: string): Promise<GeocodedLocation> {
  const normalizedAddress = normalizeAddressForIndia(address);

  try {
    const apiKey = ensureMapsKey();
    const response = await googleMapsClient.get('/geocode/json', {
      params: {
        address: normalizedAddress,
        key: apiKey
      }
    });

    const firstResult = response.data?.results?.[0];
    if (!firstResult) {
      throw new Error(`No geocoding result found for address: ${normalizedAddress}`);
    }

    return {
      formattedAddress: firstResult.formatted_address,
      latitude: firstResult.geometry.location.lat,
      longitude: firstResult.geometry.location.lng,
      placeId: firstResult.place_id
    };
  } catch (error) {
    const fallback = fallbackGeocode(normalizedAddress);
    if (fallback) {
      return fallback;
    }

    // Keep location tracing available even when external geocoding cannot resolve the address.
    return buildDeterministicFallback(normalizedAddress);
  };
}

export function buildStaticMapUrl(latitude: number, longitude: number) {
  const marker = `${latitude},${longitude}`;

  // Use Google Static Maps when key is configured, otherwise fall back to OSM static map.
  if (!env.googleMapsApiKey) {
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${marker}&zoom=9&size=1000x420&markers=${marker},red-pushpin`;
  }

  const apiKey = ensureMapsKey();
  return `https://maps.googleapis.com/maps/api/staticmap?center=${marker}&zoom=9&size=1000x420&scale=2&maptype=roadmap&markers=color:0x0f766e|label:S|${marker}&key=${apiKey}`;
}
