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

/** Mask an email for display: "priya@shop.com" -> "p***@shop.com". */
export function maskEmail(email) {
  const value = String(email || "").trim();
  const at = value.indexOf("@");
  if (at <= 0) return "";
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const visible = local.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(local.length - 1, 1))}@${domain}`;
}
