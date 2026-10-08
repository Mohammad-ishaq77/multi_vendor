import { getRoadDistanceKm } from "./roadDistance.js";

export const DELIVERY_SLABS = [
  { maxKm: 1, fee: 15 },
  { maxKm: 2, fee: 20 },
  { maxKm: 3, fee: 25 },
  { maxKm: 5, fee: 35 },
  { maxKm: 8, fee: 50 },
  { maxKm: 10, fee: 60 },
  { maxKm: 15, fee: 85 },
  { maxKm: 20, fee: 110 },
  { maxKm: 30, fee: 150 },
  { maxKm: 40, fee: 200 },
  { maxKm: 50, fee: 250 },
  { maxKm: 60, fee: 300 },
  { maxKm: 70, fee: 350 },
  { maxKm: 80, fee: 400 },
  { maxKm: 90, fee: 450 },
  { maxKm: 100, fee: 500 },
];

export const MAX_DELIVERY_DISTANCE_KM = 100;
export const NEARMART_SHARE_PERCENT = 20;
export const DELIVERY_PARTNER_SHARE_PERCENT = 80;

export const BEYOND_MAX_DISTANCE_MESSAGE = "Delivery not available in this area.";

/**
 * Pure delivery pricing: road distance (km) → fee + NearMart/delivery-partner split.
 * Never call this with client-supplied distance; distance must come from the
 * routing service (see roadDistance.js) and the fee must be computed server-side.
 */
export function calculateDeliveryFee(distanceKm) {
  const km = Number(distanceKm);
  if (!Number.isFinite(km) || km < 0) {
    throw new TypeError("calculateDeliveryFee: distanceKm must be a non-negative number.");
  }

  if (km > MAX_DELIVERY_DISTANCE_KM) {
    return {
      distanceKm: km,
      deliveryFee: 0,
      nearMartShare: 0,
      deliveryPartnerShare: 0,
      deliveryAvailable: false,
      message: BEYOND_MAX_DISTANCE_MESSAGE,
    };
  }

  const slab = DELIVERY_SLABS.find((s) => km <= s.maxKm);
  const deliveryFee = slab.fee;
  const nearMartShare = Math.round((deliveryFee * NEARMART_SHARE_PERCENT) / 100);
  const deliveryPartnerShare = deliveryFee - nearMartShare;

  return {
    distanceKm: km,
    deliveryFee,
    nearMartShare,
    deliveryPartnerShare,
    deliveryAvailable: true,
  };
}

/**
 * Single entry point for delivery pricing: shop + customer locations →
 * real road distance, fee, NearMart 20% share and delivery-partner 80% share.
 *
 * Throws RoadDistanceError when a location has no coordinates or the routing
 * service fails (callers turn that into an HTTP error). Returns
 * `deliveryAvailable: false` when the road distance exceeds the max radius.
 * Distance always comes from the routing service — never from the client.
 *
 * @param {{lat?: number|string|null, lng?: number|string|null}} shopLocation
 * @param {{lat?: number|string|null, lng?: number|string|null}} customerLocation
 */
export async function calculateDeliveryDetails(shopLocation, customerLocation) {
  const distanceKm = await getRoadDistanceKm({
    originLat: shopLocation?.lat,
    originLng: shopLocation?.lng,
    destLat: customerLocation?.lat,
    destLng: customerLocation?.lng,
  });

  const pricing = calculateDeliveryFee(distanceKm);
  return {
    distanceKm: pricing.distanceKm,
    deliveryFee: pricing.deliveryFee,
    nearMartShare: pricing.nearMartShare,
    deliveryPartnerShare: pricing.deliveryPartnerShare,
    deliveryAvailable: pricing.deliveryAvailable,
    ...(pricing.message ? { message: pricing.message } : {}),
  };
}
