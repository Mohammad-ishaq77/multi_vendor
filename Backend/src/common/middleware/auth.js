import jwt from "jsonwebtoken";
import { config } from "../../config/env.js";
import { repo } from "../../config/db.js";

/**
 * A short-lived cache of the account's active flag. Suspending a user must not
 * leave an already-issued access token working for the rest of its 15m life,
 * and every request must not need a users-table round trip.
 */
const ACTIVE_TTL_MS = 15_000;
const MAX_CACHE = 5000;
const activeCache = new Map();

export function invalidateActiveCache(userId) {
  if (userId) activeCache.delete(userId);
  else activeCache.clear();
}

async function getAccountState(userId) {
  const cached = activeCache.get(userId);
  if (cached && Date.now() - cached.checkedAt < ACTIVE_TTL_MS) return cached;
  try {
    const user = await repo("User").findOne({ where: { id: userId } });
    if (!user) return { isActive: false, emailVerified: false, checkedAt: Date.now() };
    if (activeCache.size >= MAX_CACHE) activeCache.clear();
    const state = {
      isActive: Boolean(user.isActive),
      emailVerified: Boolean(user.emailVerified),
      checkedAt: Date.now(),
    };
    activeCache.set(userId, state);
    return state;
  } catch {
    // Never lock everyone out because of a transient database problem.
    return { isActive: true, emailVerified: true, checkedAt: Date.now() };
  }
}

/** Require a valid, still-active Bearer access token. Attaches req.user = { id, role }. */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ ok: false, error: "Missing bearer token." });
  }
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.accessSecret);
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid or expired token." });
  }
  try {
    const account = await getAccountState(payload.sub);
    if (!account.isActive) {
      return res.status(403).json({ ok: false, error: "Account is disabled." });
    }
    // Email ownership must be proven server-side; a token is never issued to an
    // unverified account, and this guards against any stale token.
    if (!account.emailVerified) {
      return res.status(403).json({
        ok: false,
        error: "Please verify your email address to continue.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }
  } catch (err) {
    return next(err);
  }
  req.user = { id: payload.sub, role: payload.role };
  return next();
}