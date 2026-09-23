export function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export function pointWkt(lng, lat) {
  return `SRID=4326;POINT(${Number(lng)} ${Number(lat)})`;
}

export const hasCoords = (lat, lng) => {
  if (lat === null || lat === undefined || lat === "") return false;
  if (lng === null || lng === undefined || lng === "") return false;
  return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
};
