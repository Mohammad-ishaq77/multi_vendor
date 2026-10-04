export function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

/** GeoJSON Point for TypeORM geography columns. */
export function pointGeoJSON(lng, lat) {
  return { type: "Point", coordinates: [Number(lng), Number(lat)] };
}

export const hasCoords = (lat, lng) => {
  if (lat === null || lat === undefined || lat === "") return false;
  if (lng === null || lng === undefined || lng === "") return false;
  return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
};
