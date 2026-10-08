/**
 * MapTiler geocoding (place search + reverse geocoding) for the location picker.
 *
 * The key is the public browser key (VITE_MAPTILER_API_KEY); it is referrer
 * restricted in the MapTiler dashboard, so these calls only work from the app
 * origin. MapTiler returns GeoJSON features: [lng, lat] coordinates, a
 * `place_name` label and a `context` array with structured address parts.
 */

import { MAPTILER_API_KEY, hasMapTilerKey } from "../config/env";

const GEOCODING_BASE = "https://api.maptiler.com/geocoding";

const SEARCH_FAILED = "Location search is unavailable right now. Please try again.";
const REVERSE_FAILED = "We could not read the address for this point. Please search for it instead.";

const contextValue = (feature, prefixes) => {
  for (const entry of feature?.context || []) {
    const id = String(entry.id || "");
    if (prefixes.some((prefix) => id.startsWith(prefix))) return entry.text || "";
  }
  return "";
};

const round6 = (value) => Math.round(Number(value) * 1e6) / 1e6;

const toLocation = (feature) => {
  const coordinates = feature?.geometry?.coordinates || [];
  const placeName = feature?.place_name || "";
  const pincode = contextValue(feature, ["postcode."]);
  const state = contextValue(feature, ["region."]);
  const city = contextValue(feature, ["locality.", "district.", "place."]);
  const country = contextValue(feature, ["country."]);

  // The label is "name, city, state postcode, country" — drop the parts we
  // already expose as separate fields so the street line is not duplicated.
  const strip = [city, state, pincode, country, state && pincode ? `${state} ${pincode}` : ""].filter(Boolean);
  const line1 =
    placeName
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part && !strip.includes(part))
      .join(", ") || placeName;

  return {
    id: feature?.id || `${coordinates[0]},${coordinates[1]}`,
    label: placeName,
    name: feature?.text || placeName.split(",")[0] || "",
    lat: round6(coordinates[1]),
    lng: round6(coordinates[0]),
    line1,
    city,
    state,
    pincode,
    country,
  };
};

const geocodeUrl = (path, params = {}) => {
  const url = new URL(`${GEOCODING_BASE}/${path}`);
  url.searchParams.set("key", MAPTILER_API_KEY);
  url.searchParams.set("language", "en");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  }
  return url.toString();
};

const fetchFeatures = async (url, fallbackMessage) => {
  if (!hasMapTilerKey()) throw new Error("MapTiler key not configured.");
  let response;
  try {
    response = await fetch(url, { headers: { accept: "application/json" } });
  } catch {
    throw new Error(fallbackMessage);
  }
  if (!response.ok) throw new Error(fallbackMessage);
  try {
    const payload = await response.json();
    return Array.isArray(payload?.features) ? payload.features : [];
  } catch {
    throw new Error(fallbackMessage);
  }
};

/**
 * Forward geocoding — free-text place search for the picker's search box.
 * @returns {Promise<Array<{id:string,label:string,name:string,lat:number,lng:number,
 *          line1:string,city:string,state:string,pincode:string,country:string}>>}
 */
export async function searchPlaces(query, { limit = 6, proximity } = {}) {
  const text = String(query || "").trim();
  if (text.length < 3) return [];
  const features = await fetchFeatures(
    geocodeUrl(`${encodeURIComponent(text)}.json`, {
      limit,
      proximity: proximity ? `${proximity.lng},${proximity.lat}` : "",
    }),
    SEARCH_FAILED
  );
  return features.map(toLocation).filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng));
}

/**
 * Reverse geocoding — turns a dropped pin / current-location fix into address
 * fields the form can prefill (the user can still edit every field).
 */
export async function reverseGeocode(lng, lat) {
  const features = await fetchFeatures(
    geocodeUrl(`${Number(lng)},${Number(lat)}.json`, { limit: 1 }),
    REVERSE_FAILED
  );
  if (!features.length) throw new Error(REVERSE_FAILED);
  const location = toLocation(features[0]);
  return { ...location, formattedAddress: location.label };
}

export default { searchPlaces, reverseGeocode };
