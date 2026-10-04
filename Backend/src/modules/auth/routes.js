import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { validate } from "../../common/middleware/validate.js";
import {
  getMe,
  loginSchema,
  loginUser,
  logoutUser,
  registerSchema,
  registerUser,
  rotateRefresh,
} from "./service.js";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user (role-selected)
 *     requestBody: { required: true, content: { application/json: { schema: { type: object } } } }
 *     responses: { 201: { description: Created } }
 */
router.post(
  "/register",
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const session = await registerUser(req.body);
    res.status(201).json({ ok: true, ...session });
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
