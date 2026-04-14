import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Shipment } from '../models/Shipment';
import { renderRouteMap } from '../services/aiClient';
import { buildStaticMapUrl, geocodeAddress } from '../services/locationService';

async function geocodeWithFallback(candidates: string[]) {
  let lastError: unknown;

  for (const candidate of candidates) {
    const address = candidate.trim();
    if (!address) {
      continue;
    }

    try {
      return await geocodeAddress(address);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to geocode address candidates');
}

export const geocode = asyncHandler(async (req: Request, res: Response) => {
  const location = await geocodeAddress(String(req.query.address));

  res.json({
    data: {
      ...location,
      staticMapUrl: buildStaticMapUrl(location.latitude, location.longitude),
      mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.formattedAddress)}`
    }
  });
});

export const shipmentLocation = asyncHandler(async (req: Request, res: Response) => {
  const shipmentId = String(req.params.id);
  const ownerId = req.user?.id ?? '';

  const shipment = await Shipment.findOne({ _id: shipmentId, owner: ownerId }).select('trackingNumber origin destination currentLocation').lean();

  if (!shipment) {
    const error = new Error('Shipment not found');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const [origin, destination] = await Promise.all([
    geocodeWithFallback([shipment.origin]),
    geocodeWithFallback([shipment.destination])
  ]);

  const currentLocation = await geocodeWithFallback([
    shipment.currentLocation,
    `${shipment.currentLocation}, ${shipment.destination}`,
    shipment.destination,
    shipment.origin
  ]);

  let foliumMapHtml: string | undefined;
  try {
    const mapPayload = await renderRouteMap({
      trackingNumber: shipment.trackingNumber,
      origin: {
        latitude: origin.latitude,
        longitude: origin.longitude,
        label: origin.formattedAddress
      },
      current: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        label: currentLocation.formattedAddress
      },
      destination: {
        latitude: destination.latitude,
        longitude: destination.longitude,
        label: destination.formattedAddress
      }
    });

    foliumMapHtml = mapPayload.html;
  } catch {
    foliumMapHtml = undefined;
  }

  res.json({
    data: {
      trackingNumber: shipment.trackingNumber,
      foliumMapHtml,
      currentLocation: {
        ...currentLocation,
        staticMapUrl: buildStaticMapUrl(currentLocation.latitude, currentLocation.longitude)
      },
      origin,
      destination,
      mapsDirectionsLink: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin.formattedAddress)}&destination=${encodeURIComponent(destination.formattedAddress)}&travelmode=driving`
    }
  });
});
