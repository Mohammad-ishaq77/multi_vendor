import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { validate } from "../../common/middleware/validate.js";
import { otpSendLimiter, otpVerifyLimiter } from "../../common/middleware/rateLimit.js";
import {
  emailOnlySchema,
  getMe,
  loginSchema,
  loginUser,
  logoutUser,
  registerSchema,
  registerUser,
  resendVerification,
  resetPassword,
  resetPasswordSchema,
  rotateRefresh,
  verifyEmail,
  verifyEmailSchema,
  verifyResetOtp,
  forgotPassword,
} from "./service.js";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user (role-selected) and email a verification OTP
 *     requestBody: { required: true, content: { application/json: { schema: { type: object } } } }
 *     responses: { 201: { description: Pending email verification } }
 */
router.post(
  "/register",
  otpSendLimiter,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const result = await registerUser(req.body);
    // No session yet: the account stays inactive until the OTP is verified.
    res.status(201).json({ ok: true, ...result });
  })
);

/**
 * @openapi
 * /api/auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify a registration OTP and start the session
 *     responses: { 200: { description: Session with access + refresh tokens } }
 */
router.post(
  "/verify-email",
  otpVerifyLimiter,
  validate({ body: verifyEmailSchema }),
  asyncHandler(async (req, res) => {
    const session = await verifyEmail(req.body);
    res.json({ ok: true, ...session });
  })
);

/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend a registration OTP (generic response)
 *     responses: { 200: { description: OK } }
 */
router.post(
  "/resend-verification",
  otpSendLimiter,
  validate({ body: emailOnlySchema }),
  asyncHandler(async (req, res) => {
    const result = await resendVerification(req.body);
    res.json(result);
  })
);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Start a password reset (generic response, emails an OTP)
 *     responses: { 200: { description: OK } }
 */
router.post(
  "/forgot-password",
  otpSendLimiter,
  validate({ body: emailOnlySchema }),
  asyncHandler(async (req, res) => {
    const result = await forgotPassword(req.body);
    res.json(result);
  })
);

/**
 * @openapi
 * /api/auth/verify-reset-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify a password-reset OTP and return a single-use reset token
 *     responses: { 200: { description: Reset token } }
 */
router.post(
  "/verify-reset-otp",
  otpVerifyLimiter,
  validate({ body: verifyEmailSchema }),
  asyncHandler(async (req, res) => {
    const result = await verifyResetOtp(req.body);
    res.json({ ok: true, ...result });
  })
);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Set a new password using a single-use reset token
 *     responses: { 200: { description: Password updated } }
 */
router.post(
  "/reset-password",
  otpVerifyLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(async (req, res) => {
    const result = await resetPassword(req.body);
    res.json(result);
  })
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email + password (+ optional role check)
 *     responses: { 200: { description: Session with access + refresh tokens } }
 */
router.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const session = await loginUser(req.body);
    res.json({ ok: true, ...session });
  })
);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate refresh token
 *     responses: { 200: { description: New session } }
 */
router.post(
  "/refresh",
  validate({
    body: z.object({
      refreshToken: z.string().min(1),
      role: z.enum(["customer", "shopkeeper", "delivery", "admin"]).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const session = await rotateRefresh(req.body.refreshToken, req.body.role);
    res.json({ ok: true, ...session });
  })
);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke a refresh token
 *     responses: { 200: { description: Logged out } }
 */
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    await logoutUser(req.body?.refreshToken);
    res.json({ ok: true });
  })
);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Current user session
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Current user } }
 */
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getMe(req.user.id);
    // The role carried by the token is the session's active role; a multi-role
    // account must not fall back to its primary role after a page reload.
    res.json({ ok: true, user: { ...user, activeRole: req.user.role } });
  })
);

export default router;
