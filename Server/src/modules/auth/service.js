import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../../config/env.js";
import { repo } from "../../config/db.js";
import { publicUser } from "../../entities/User.js";

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

export async function registerUser(input) {
  const users = repo("User");
  const email = input.email.toLowerCase().trim();
  const existing = await users.findOne({ where: { email } });
  if (existing) throw Object.assign(new Error("Email already registered."), { status: 409 });
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await users.save(
    users.create({
      name: input.name,
      email,
      phone: input.phone,
      passwordHash,
      role: input.role || "customer",
    })
  );
  return issueSession(user);
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
