import jwt from "jsonwebtoken";
import { config } from "../../config/env.js";

/** Require a valid Bearer access token. Attaches req.user = { id, role }. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ ok: false, error: "Missing bearer token." });
  }
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid or expired token." });
  }
}
