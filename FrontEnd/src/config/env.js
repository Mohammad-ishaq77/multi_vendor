/**
 * Single source of truth for every client-visible environment value.
 *
 * Vite only exposes variables prefixed with `VITE_` to browser code, so this
 * file is the only place that touches `import.meta.env`. Server-only secrets
 * (DATABASE_URL, JWT_*, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
 * CLOUDINARY_API_SECRET) are never read here — they stay in Server/.env.
 */

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const env = import.meta.env || {};

/** Base URL for every REST call. Defaults to "/api" so the Vite proxy applies. */
export const API_BASE_URL = trimTrailingSlash(env.VITE_API_BASE_URL || "/api");

/**
 * Absolute origin used for relative API URLs and for the Socket.IO handshake.
 * In development the Vite proxy forwards "/api" and "/socket.io" to the server,
 * so the browser should keep talking to its own origin.
 */
export const API_ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "";

/** Public Razorpay key. Safe for the browser; the secret never is. */
export const RAZORPAY_PUBLIC_KEY = env.VITE_RAZORPAY_KEY_ID || "";

/** How long the API client waits before aborting a request (ms). */
export const API_TIMEOUT_MS = Number(env.VITE_API_TIMEOUT_MS) || 20000;

export const hasRazorpayPublicKey = () => Boolean(RAZORPAY_PUBLIC_KEY);

/** Socket.IO endpoint — proxied in dev, so same-origin by default. */
export const SOCKET_URL = trimTrailingSlash(env.VITE_SOCKET_URL || "") || API_ORIGIN;

/** True when the frontend is running against a live backend API. */
export const hasApiBase = () => Boolean(API_BASE_URL);

export default {
  API_BASE_URL,
  API_ORIGIN,
  API_TIMEOUT_MS,
  RAZORPAY_PUBLIC_KEY,
  SOCKET_URL,
  hasApiBase,
  hasRazorpayPublicKey,
};