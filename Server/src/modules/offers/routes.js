import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { repo } from "../../config/db.js";

const router = Router();

const offerSchema = z.object({
  shopId: z.string().uuid().optional(),
  title: z.string().max(150).optional(),
  description: z.string().optional(),
  discountType: z.enum(["flat", "percentage"]).optional(),
  discountValue: z.coerce.number().optional(),
  minOrder: z.coerce.number().optional(),
  maxDiscount: z.coerce.number().optional(),
  code: z.string().max(30).optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/offers — public active offers (optionally by shop). */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const where = { isActive: true };
    if (req.query.shopId) where.shopId = req.query.shopId;
    const items = await repo("Offer").find({ where, order: { createdAt: "DESC" } });
    res.json({ ok: true, data: items });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("shopkeeper", "admin"),
  validate({ body: offerSchema }),
  asyncHandler(async (req, res) => {
    const offers = repo("Offer");
    let shopId = req.body.shopId;
    if (req.user.role !== "admin" || !shopId) {
      const shop = await repo("Shop").findOne({ where: { ownerId: req.user.id } });
      if (!shop) return res.status(400).json({ ok: false, error: "Create a shop first." });
      shopId = shop.id;
    }
    const created = await offers.save(offers.create({ ...req.body, shopId }));
    res.status(201).json({ ok: true, data: created });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole("shopkeeper", "admin"),
  validate({ body: offerSchema.partial() }),
  asyncHandler(async (req, res) => {
    const offers = repo("Offer");
    const item = await offers.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ ok: false, error: "Offer not found." });
    Object.assign(item, req.body);
    res.json({ ok: true, data: await offers.save(item) });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("shopkeeper", "admin"),
  asyncHandler(async (req, res) => {
    await repo("Offer").delete({ id: req.params.id });
    res.json({ ok: true });
  })
);

export default router;
