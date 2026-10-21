import rateLimit from "express-rate-limit";

/**
 * Route-scoped rate limiters for the OTP endpoints. The global limiter in
 * `src/index.js` is deliberately generous; these are stricter because an OTP
 * endpoint sends email and is the target of abuse.
 *
 * Responses use the same `{ ok:false, error }` envelope as the rest of the API.
 */
function limiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: message },
  });
}

const TOO_MANY = "Too many requests. Please wait a few minutes and try again.";

/** Sending an OTP (register/resend/forgot). */
export const otpSendLimiter = limiter({ windowMs: 15 * 60 * 1000, max: 12, message: TOO_MANY });

/** Verifying an OTP or submitting a new password. */
export const otpVerifyLimiter = limiter({ windowMs: 15 * 60 * 1000, max: 30, message: TOO_MANY });

/** Delivery OTP request/submission. */
export const deliveryOtpLimiter = limiter({ windowMs: 15 * 60 * 1000, max: 30, message: TOO_MANY });
