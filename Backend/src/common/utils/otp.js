import crypto from "crypto";
import { IsNull, MoreThanOrEqual } from "typeorm";
import { config } from "../../config/env.js";
import { AppDataSource, repo } from "../../config/db.js";
import { httpError } from "../middleware/error.js";

/**
 * Purpose-scoped OTP engine shared by registration, password reset and delivery
 * confirmation.
 *
 * Guarantees enforced here (not on the client):
 *  - six-digit codes from a CSPRNG (`crypto.randomInt`), never `Math.random`
 *  - only keyed hashes are persisted; the plaintext code exists only long
 *    enough to be emailed
 *  - codes expire, are single-use, and are superseded when re-requested
 *  - a resend cooldown and an hourly cap throttle abuse
 *  - verification attempts are counted and locked out
 *  - every query is scoped by `purpose` (and `orderId` for deliveries), so an
 *    OTP minted for one flow can never satisfy another
 */

export const OTP_PURPOSES = Object.freeze({
  REGISTER: "register",
  PASSWORD_RESET: "password_reset",
  DELIVERY: "delivery",
});

export const OTP_POLICY = Object.freeze({
  register: { ttlMinutes: 5, maxAttempts: 5, cooldownSeconds: 30, hourlyLimit: 8 },
  password_reset: { ttlMinutes: 5, maxAttempts: 5, cooldownSeconds: 30, hourlyLimit: 8 },
  delivery: { ttlMinutes: 10, maxAttempts: 5, cooldownSeconds: 30, hourlyLimit: 10 },
});

export const RESET_TOKEN_TTL_MINUTES = 10;

const otpSecret = () => config.jwt.accessSecret;
const normalizeEmail = (email) => String(email || "").toLowerCase().trim();

/* ------------------------------ pure helpers ------------------------------ */

/** Six-digit numeric code from a CSPRNG (uniform, zero-padded). */
export function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Keyed hash of a code. The purpose is part of the digest so the same code in
 * two flows hashes differently, and the server secret prevents an offline
 * brute-force if the table ever leaks.
 */
export function hashOtp(code, purpose) {
  return crypto
    .createHmac("sha256", otpSecret())
    .update(`${purpose}:${String(code ?? "").trim()}`)
    .digest("hex");
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashResetToken(token) {
  return crypto
    .createHmac("sha256", otpSecret())
    .update(`reset:${String(token ?? "").trim()}`)
    .digest("hex");
}

/** Constant-time string comparison (length-safe). */
export function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ""));
  const right = Buffer.from(String(b ?? ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function isExpired(row, now = new Date()) {
  return !row?.expiresAt || new Date(row.expiresAt).getTime() <= now.getTime();
}

/** Pure decision function used by the DB verifier and the unit tests. */
export function evaluateOtp(row, code, purpose, now = new Date()) {
  if (!row) return { status: "missing" };
  if (row.consumedAt) return { status: "used" };
  if (isExpired(row, now)) return { status: "expired" };
  if (Number(row.attempts) >= Number(row.maxAttempts)) return { status: "locked" };
  if (!safeEqual(hashOtp(code, purpose), row.codeHash)) return { status: "mismatch" };
  return { status: "ok" };
}

/* ------------------------------ DB operations ----------------------------- */

/**
 * Mint a new OTP for a target. Supersedes any live code, then persists the
 * hash. Returns the plaintext code once, for the caller to email.
 */
export async function createOtp({
  email,
  purpose,
  userId = null,
  orderId = null,
  ttlMinutes,
  maxAttempts,
  store,
} = {}) {
  if (!OTP_POLICY[purpose]) throw httpError(500, "Unknown OTP purpose.");
  const codes = store || repo("OtpCode");
  const target = normalizeEmail(email);
  const policy = OTP_POLICY[purpose];
  const ttl = ttlMinutes ?? policy.ttlMinutes;
  const max = maxAttempts ?? policy.maxAttempts;
  const now = new Date();

  const activeWhere = { email: target, purpose, consumedAt: IsNull() };
  if (orderId) activeWhere.orderId = orderId;

  const active = await codes.findOne({ where: activeWhere, order: { createdAt: "DESC" } });
  if (active && !isExpired(active, now)) {
    const elapsed = now.getTime() - new Date(active.createdAt).getTime();
    if (elapsed < policy.cooldownSeconds * 1000) {
      const retryAfter = Math.ceil((policy.cooldownSeconds * 1000 - elapsed) / 1000);
      throw Object.assign(
        new Error(`Please wait ${retryAfter}s before requesting another code.`),
        { status: 429, code: "OTP_COOLDOWN", retryAfter }
      );
    }
  }

  const windowStart = new Date(now.getTime() - 60 * 60 * 1000);
  const recentCount = await codes.count({
    where: { email: target, purpose, createdAt: MoreThanOrEqual(windowStart) },
  });
  if (recentCount >= policy.hourlyLimit) {
    throw Object.assign(
      new Error("Too many codes requested. Please try again later."),
      { status: 429, code: "OTP_RATE_LIMIT" }
    );
  }

  // Invalidate superseded codes (expired ones included) in one atomic update.
  await codes.update(activeWhere, { consumedAt: now });

  const code = generateOtp();
  const row = await codes.save(
    codes.create({
      userId,
      email: target,
      purpose,
      codeHash: hashOtp(code, purpose),
      orderId,
      attempts: 0,
      maxAttempts: max,
      expiresAt: new Date(now.getTime() + ttl * 60 * 1000),
    })
  );

  return { code, expiresAt: row.expiresAt, ttlMinutes: ttl, row };
}

/** Invalidate every live code for a target (used to undo a failed send). */
export async function consumeActiveOtps({ email, purpose, orderId, store } = {}) {
  const codes = store || repo("OtpCode");
  const where = { email: normalizeEmail(email), purpose, consumedAt: IsNull() };
  if (orderId) where.orderId = orderId;
  await codes.update(where, { consumedAt: new Date() });
}

/**
 * Verify and consume a code. Runs in a transaction with a row lock so a code
 * can never be redeemed twice by concurrent requests.
 */
export async function verifyOtp({ email, purpose, orderId = null, code } = {}) {
  const target = normalizeEmail(email);
  const value = String(code ?? "").trim();
  if (!/^\d{6}$/.test(value)) {
    throw httpError(400, "Enter the 6-digit code from your email.");
  }

  return AppDataSource.transaction(async (manager) => {
    const codes = manager.getRepository("OtpCode");
    const where = { email: target, purpose, consumedAt: IsNull() };
    if (orderId) where.orderId = orderId;
    const row = await codes.findOne({
      where,
      order: { createdAt: "DESC" },
      lock: { mode: "pessimistic_write" },
    });

    const verdict = evaluateOtp(row, value, purpose);
    switch (verdict.status) {
      case "missing":
        throw httpError(400, "This code has expired or was already used. Request a new one.");
      case "used":
        throw httpError(400, "This code has already been used. Request a new code.");
      case "locked":
        throw httpError(429, "Too many incorrect attempts. Request a new code.");
      case "expired":
        row.consumedAt = new Date();
        await codes.save(row);
        throw httpError(400, "This code has expired. Request a new code.");
      case "mismatch": {
        row.attempts = Number(row.attempts) + 1;
        await codes.save(row);
        const remaining = Math.max(Number(row.maxAttempts) - Number(row.attempts), 0);
        throw httpError(
          400,
          remaining > 0
            ? `Incorrect code. ${remaining} ${remaining === 1 ? "attempt" : "attempts"} left.`
            : "Too many incorrect attempts. Request a new code."
        );
      }
      default:
        row.consumedAt = new Date();
        row.attempts = Number(row.attempts) + 1;
        await codes.save(row);
        return row;
    }
  });
}

/**
 * After a successful password-reset OTP check, hand the client a single-use
 * reset token (stored only as a hash against the OTP row).
 */
export async function attachResetToken(row) {
  const token = generateResetToken();
  const codes = repo("OtpCode");
  row.resetTokenHash = hashResetToken(token);
  row.resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  row.resetTokenUsedAt = null;
  await codes.save(row);
  return { token, expiresInMinutes: RESET_TOKEN_TTL_MINUTES };
}

/**
 * Atomically claim a reset token and run `handler` inside the same transaction
 * before marking the token used. A replayed token finds `reset_token_used_at`
 * set and is rejected.
 */
export async function withResetToken({ email, token }, handler) {
  const target = normalizeEmail(email);
  const value = String(token ?? "").trim();
  if (!value) throw httpError(400, "This password reset link is invalid or has expired.");
  const hash = hashResetToken(value);

  return AppDataSource.transaction(async (manager) => {
    const codes = manager.getRepository("OtpCode");
    const row = await codes.findOne({
      where: { email: target, resetTokenHash: hash },
      lock: { mode: "pessimistic_write" },
    });
    if (!row) throw httpError(400, "This password reset link is invalid or has expired.");
    if (row.resetTokenUsedAt) throw httpError(400, "This password reset link has already been used.");
    if (!row.resetTokenExpiresAt || new Date(row.resetTokenExpiresAt) < new Date()) {
      throw httpError(400, "This password reset link has expired. Please start again.");
    }
    const result = await handler({ row, manager, codes });
    row.resetTokenUsedAt = new Date();
    await codes.save(row);
    return result;
  });
}
