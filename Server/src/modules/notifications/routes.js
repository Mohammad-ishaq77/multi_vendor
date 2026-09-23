import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";

const router = Router();
router.use(requireAuth);

/** GET /api/notifications */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const [items, total] = await repo("Notification").findAndCount({
      where: { userId: req.user.id },
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** PATCH /api/notifications/:id/read */
router.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const notifications = repo("Notification");
    const item = await notifications.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ ok: false, error: "Notification not found." });
    item.isRead = true;
    res.json({ ok: true, data: await notifications.save(item) });
  })
);

/** POST /api/notifications — internal/system (admin or self). */
router.post(
  "/",
  validate({
    body: z.object({
      userId: z.string().uuid().optional(),
      title: z.string().max(150),
      message: z.string(),
      type: z.string().max(50).optional(),
      metadata: z.record(z.any()).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const target = req.user.role === "admin" && req.body.userId ? req.body.userId : req.user.id;
    const notifications = repo("Notification");
    const created = await notifications.save(
      notifications.create({ ...req.body, userId: target })
    );
    res.status(201).json({ ok: true, data: created });
  })
);

export default router;
