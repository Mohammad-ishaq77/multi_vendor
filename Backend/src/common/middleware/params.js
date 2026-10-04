const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,179}$/i;

export function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

const invalid = (res, name, expected) =>
  res.status(400).json({
    ok: false,
    error: "Validation failed.",
    issues: [{ path: `params.${name}`, message: expected }],
  });

/**
 * Express param callback: a malformed UUID must fail with 400 before it ever
 * reaches TypeORM, otherwise Postgres raises "invalid input syntax for type uuid"
 * and the raw driver message leaks through a 500.
 */
export function uuidParam(name = "id") {
  return (req, res, next, value) =>
    isUuid(value) ? next() : invalid(res, name, "Must be a valid UUID.");
}

/** Param callback for routes that accept either a UUID or a slug. */
export function idOrSlugParam(name = "idOrSlug") {
  return (req, res, next, value) => {
    if (isUuid(value)) return next();
    if (typeof value === "string" && SLUG_RE.test(value)) return next();
    return invalid(res, name, "Must be a valid UUID or slug.");
  };
}

/** Every dynamic route parameter in this API is a UUID except the category slug. */
export const UUID_PARAMS = ["id", "productId", "orderId", "paymentId", "shopId", "applicantId"];

export function registerParamValidators(app) {
  for (const name of UUID_PARAMS) app.param(name, uuidParam(name));
  app.param("idOrSlug", idOrSlugParam("idOrSlug"));
}