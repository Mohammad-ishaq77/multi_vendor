import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../../config/env.js";
import { repo } from "../../config/db.js";
import { publicUser } from "../../entities/User.js";
import { httpError } from "../../common/middleware/error.js";
import {
  sendRegistrationOtpEmail,
  sendPasswordResetOtpEmail,
} from "../../common/email/service.js";
import {
  OTP_PURPOSES,
  attachResetToken,
  consumeActiveOtps,
  createOtp,
  verifyOtp,
  withResetToken,
} from "../../common/utils/otp.js";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(150),
  phone: z.string().max(15).optional(),
  password: z.string().min(4).max(100),
  role: z.enum(["customer", "shopkeeper", "delivery", "admin"]).default("customer"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["customer", "shopkeeper", "delivery", "admin"]).optional(),
});

export const emailOnlySchema = z.object({
  email: z.string().email().max(150),
});

export const verifyEmailSchema = z.object({
  email: z.string().email().max(150),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export const resetPasswordSchema = z.object({
  email: z.string().email().max(150),
  resetToken: z.string().min(10).max(200),
  newPassword: z.string().min(4).max(100),
});

/**
 * Which role a session should carry. Multi-role accounts pick a role at login and
 * repeat it on refresh, so a refreshed token must not silently fall back to the
 * account's primary role.
 */
export function resolveActiveRole(user, requestedRole) {
  const allowed = Array.from(new Set([user.role, ...(user.allowedRoles || [])]));
  if (requestedRole && allowed.includes(requestedRole)) return requestedRole;
  return user.role;
}

function signAccess(user, activeRole) {
  return jwt.sign({ role: activeRole || user.role }, config.jwt.accessSecret, {
    subject: user.id,
    expiresIn: config.jwt.accessTtl,
  });
}

function newRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

function refreshExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + config.jwt.refreshTtlDays);
  return d;
}

const isOtpRateError = (err) =>
  err?.code === "OTP_COOLDOWN" || err?.code === "OTP_RATE_LIMIT";

/** Persist a registration OTP and email it. Rolls back the code if mail fails. */
async function sendRegistrationOtp(user) {
  const { code, ttlMinutes } = await createOtp({
    email: user.email,
    purpose: OTP_PURPOSES.REGISTER,
    userId: user.id,
  });
  try {
    await sendRegistrationOtpEmail({
      to: user.email,
      name: user.name,
      code,
      expiresInMinutes: ttlMinutes,
    });
  } catch {
    await consumeActiveOtps({ email: user.email, purpose: OTP_PURPOSES.REGISTER }).catch(() => {});
    throw httpError(502, "We could not send the verification email. Please try again shortly.");
  }
}

/**
 * Create (or refresh) an unverified account and email a verification OTP.
 * No session is issued — the account only becomes usable after `verifyEmail`.
 */
export async function registerUser(input) {
  const users = repo("User");
  const email = input.email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const existing = await users.findOne({ where: { email } });

  if (existing) {
    // A verified address is a hard conflict; an unverified one is a retry of
    // the same sign-up, so refresh the pending record instead of duplicating.
    if (existing.emailVerified) throw httpError(409, "Email already registered.");
    if (!existing.isActive) throw httpError(403, "This account has been disabled.");
    existing.name = input.name;
    existing.phone = input.phone ?? existing.phone;
    existing.passwordHash = passwordHash;
    existing.role = input.role || existing.role;
    await users.save(existing);
    await sendRegistrationOtp(existing);
    return { pending: true, email, role: existing.role, emailVerified: false };
  }

  const user = await users.save(
    users.create({
      name: input.name,
      email,
      phone: input.phone,
      passwordHash,
      role: input.role || "customer",
      emailVerified: false,
    })
  );
  await sendRegistrationOtp(user);
  return { pending: true, email, role: user.role, emailVerified: false };
}

/** Verify a registration OTP, activate the account and start a session. */
export async function verifyEmail({ email, otp }) {
  const users = repo("User");
  const normalized = String(email).toLowerCase().trim();
  const user = await users.findOne({ where: { email: normalized } });
  if (!user) throw httpError(400, "Invalid or expired verification code.");
  if (user.emailVerified) {
    throw httpError(400, "This email is already verified. Please sign in.");
  }
  if (!user.isActive) throw httpError(403, "This account has been disabled.");

  await verifyOtp({ email: normalized, purpose: OTP_PURPOSES.REGISTER, code: otp });

  user.emailVerified = true;
  await users.save(user);
  return issueSession(user);
}

/** Resend a registration OTP. Always a generic response (no account probing). */
export async function resendVerification({ email }) {
  const normalized = String(email).toLowerCase().trim();
  const user = await repo("User").findOne({ where: { email: normalized } });
  if (!user || user.emailVerified || !user.isActive) return { ok: true };
  try {
    await sendRegistrationOtp(user);
  } catch (err) {
    if (isOtpRateError(err)) return { ok: true };
    throw err;
  }
  return { ok: true };
}

/**
 * Start a password reset. The response is identical whether or not the email is
 * registered, so this endpoint cannot enumerate accounts.
 */
export async function forgotPassword({ email }) {
  const normalized = String(email).toLowerCase().trim();
  const user = await repo("User").findOne({ where: { email: normalized } });
  const generic = { ok: true, message: "If an account exists for that email, a reset code has been sent." };
  if (!user || !user.isActive) return generic;
  try {
    const { code, ttlMinutes } = await createOtp({
      email: normalized,
      purpose: OTP_PURPOSES.PASSWORD_RESET,
      userId: user.id,
    });
    await sendPasswordResetOtpEmail({
      to: normalized,
      name: user.name,
      code,
      expiresInMinutes: ttlMinutes,
    }).catch(async (err) => {
      // Release the code so the user can retry immediately; never echo why.
      await consumeActiveOtps({ email: normalized, purpose: OTP_PURPOSES.PASSWORD_RESET }).catch(() => {});
      console.warn(`password-reset email failed for ${normalized}: ${err?.name || "Error"}`);
    });
  } catch (err) {
    // Cooldown/rate limits are also swallowed: surfacing them would leak
    // whether the address is registered.
    if (err?.code === "OTP_COOLDOWN" || err?.code === "OTP_RATE_LIMIT") return generic;
    console.warn(`password-reset OTP creation failed: ${err?.name || "Error"}`);
  }
  return generic;
}

/** Verify a password-reset OTP and issue a single-use reset token. */
export async function verifyResetOtp({ email, otp }) {
  const normalized = String(email).toLowerCase().trim();
  const user = await repo("User").findOne({ where: { email: normalized } });
  if (!user || !user.isActive) throw httpError(400, "Invalid or expired code.");
  const row = await verifyOtp({
    email: normalized,
    purpose: OTP_PURPOSES.PASSWORD_RESET,
    code: otp,
  });
  return attachResetToken(row);
}

/** Consume the reset token and set the new password (revokes old sessions). */
export async function resetPassword({ email, resetToken, newPassword }) {
  const normalized = String(email).toLowerCase().trim();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  return withResetToken({ email: normalized, token: resetToken }, async ({ row, manager }) => {
    const users = manager.getRepository("User");
    const user = await users.findOne({ where: { id: row.userId } });
    if (!user || String(user.email).toLowerCase() !== normalized) {
      throw httpError(400, "This password reset link is invalid or has expired.");
    }
    user.passwordHash = passwordHash;
    await users.save(user);
    await manager.getRepository("RefreshToken").delete({ userId: user.id });
    return { ok: true };
  });
}

export async function loginUser({ email, password, role }) {
  const users = repo("User");
  const user = await users.findOne({
    where: { email: String(email).toLowerCase().trim() },
  });
  if (!user) throw Object.assign(new Error("Invalid credentials."), { status: 401 });
  const activeRole = resolveActiveRole(user, role);
  if (role && activeRole !== role) {
    throw Object.assign(new Error("Invalid credentials for this role."), { status: 401 });
  }
  if (!user.isActive) throw Object.assign(new Error("Account is disabled."), { status: 403 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw Object.assign(new Error("Invalid credentials."), { status: 401 });
  if (!user.emailVerified) {
    throw Object.assign(
      new Error("Please verify your email address before signing in. Check your inbox for the code."),
      { status: 403, code: "EMAIL_NOT_VERIFIED" }
    );
  }
  return issueSession(user, activeRole);
}

export async function issueSession(user, activeRole) {
  const tokens = repo("RefreshToken");
  const role = resolveActiveRole(user, activeRole);
  const accessToken = signAccess(user, role);
  const refreshToken = newRefreshToken();
  await tokens.save(
    tokens.create({ userId: user.id, token: refreshToken, expiresAt: refreshExpiry() })
  );
  const pub = publicUser(user);
  pub.activeRole = role;
  return { user: pub, accessToken, refreshToken };
}

export async function rotateRefresh(oldToken, requestedRole) {
  const tokens = repo("RefreshToken");
  const users = repo("User");
  const stored = await tokens.findOne({ where: { token: oldToken } });
  if (!stored) throw Object.assign(new Error("Invalid refresh token."), { status: 401 });
  if (new Date(stored.expiresAt) < new Date()) {
    await tokens.delete({ id: stored.id });
    throw Object.assign(new Error("Refresh token expired."), { status: 401 });
  }
  const user = await users.findOne({ where: { id: stored.userId } });
  if (!user || !user.isActive) throw Object.assign(new Error("Account unavailable."), { status: 401 });
  await tokens.delete({ id: stored.id });
  return issueSession(user, resolveActiveRole(user, requestedRole));
}

export async function logoutUser(oldToken) {
  if (!oldToken) return;
  try {
    await repo("RefreshToken").delete({ token: oldToken });
  } catch {
    // DB down - nothing to revoke
  }
}

export async function getMe(userId) {
  const user = await repo("User").findOne({ where: { id: userId } });
  if (!user) throw Object.assign(new Error("User not found."), { status: 404 });
  return publicUser(user);
}

/** Pure helper (unit-tested): Razorpay payment signature check. */
export function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}
