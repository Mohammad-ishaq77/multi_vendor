import { config } from "../../config/env.js";
import { hasCoords } from "./helpers.js";

const DEFAULT_ROUTING_URL = "https://router.project-osrm.org";

export const DELIVERY_MESSAGES = {
  SHOP_LOCATION: "Shop location is not available. Please ask the shopkeeper to set the shop location.",
  CUSTOMER_LOCATION: "Please select your delivery location on the map.",
  ROUTING_FAILED: "Unable to calculate delivery distance. Please try again.",
  NO_ROUTE: "Delivery is not available for this location.",
};

export class RoadDistanceError extends Error {
  constructor(message, { status = 400, code = "ROAD_DISTANCE_ERROR" } = {}) {
    super(message);
    this.name = "RoadDistanceError";
    this.status = status;
    this.code = code;
  }
}

/**
 * ROAD/DRIVING distance in meters from the OSRM routing service.
 * Straight-line (haversine/PostGIS) distance must never be used for pricing.
 */
export async function getRoadDistanceMeters({ originLat, originLng, destLat, destLng }) {
  if (!hasCoords(originLat, originLng)) {
    throw new RoadDistanceError(DELIVERY_MESSAGES.SHOP_LOCATION, { code: "SHOP_LOCATION_MISSING" });
  }
  if (!hasCoords(destLat, destLng)) {
    throw new RoadDistanceError(DELIVERY_MESSAGES.CUSTOMER_LOCATION, { code: "CUSTOMER_LOCATION_MISSING" });
  }

  const routingFailed = new RoadDistanceError(DELIVERY_MESSAGES.ROUTING_FAILED, {
    status: 502,
    code: "ROUTING_SERVICE_FAILED",
  });

  const providers = [...new Set([config.routing.osrmBaseUrl, DEFAULT_ROUTING_URL])];
  let payload = null;
  for (const provider of providers) {
    const url =
      `${provider}/route/v1/driving/` +
      `${Number(originLng)},${Number(originLat)};${Number(destLng)},${Number(destLat)}` +
      `?overview=false&alternatives=false&steps=false`;
    const controller = new AbortController();
    let timer;
    try {
      const timedOut = new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(routingFailed);
        }, config.routing.timeoutMs);
      });
      payload = await Promise.race([
        (async () => {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: { accept: "application/json" },
          });
          if (!response.ok) throw routingFailed;
          return response.json();
        })(),
        timedOut,
      ]);
      break;
    } catch {
      console.warn(`Road routing request failed for ${new URL(provider).host}.`);
    } finally {
      clearTimeout(timer);
    }
  }

  if (!payload) {
    throw routingFailed;
  }

  const meters = Number(payload?.routes?.[0]?.distance);
  if (payload?.code !== "Ok" || !Number.isFinite(meters) || meters < 0) {
    throw new RoadDistanceError(DELIVERY_MESSAGES.NO_ROUTE, { code: "ROUTE_NOT_FOUND" });
  }
  return meters;
}

/** ROAD/DRIVING distance in kilometers, preserving the routing service precision. */
export async function getRoadDistanceKm(coords) {
  const meters = await getRoadDistanceMeters(coords);
  return meters / 1000;
}
