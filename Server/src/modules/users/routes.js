import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";
import { publicUser } from "../../entities/User.js";

const router = Router();
router.use(requireAuth);

/** GET /api/users — admin user management list. */
router.get(
  "/",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = req.query.role ? { role: req.query.role } : {};
    const [items, total] = await repo("User").findAndCount({
      where,
      skip,
      take,
      order: { createdAt: "DESC" },
    });
    res.json(pagedResponse(items.map(publicUser), total, page, limit));
  })
);

/** GET /api/users/:id */
router.get(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const user = await repo("User").findOne({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ ok: false, error: "User not found." });
    res.json({ ok: true, data: publicUser(user) });
  })
);

/** PATCH /api/users/:id — activate/deactivate or change role. */
router.patch(
  "/:id",
  requireRole("admin"),
  validate({
    body: z.object({
      isActive: z.boolean().optional(),
      role: z.enum(["customer", "shopkeeper", "delivery", "admin"]).optional(),
      name: z.string().min(2).max(100).optional(),
      phone: z.string().max(15).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const users = repo("User");
    const user = await users.findOne({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ ok: false, error: "User not found." });
    Object.assign(user, req.body);
    res.json({ ok: true, data: publicUser(await users.save(user)) });
  })
);

export default router;
