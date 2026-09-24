import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { validate } from "../../common/middleware/validate.js";
import { hasCoords, pointGeoJSON } from "../../common/utils/helpers.js";
import { repo } from "../../config/db.js";

const router = Router();
router.use(requireAuth);

const addressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().max(100).optional(),
  phone: z.string().max(15).optional(),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  isDefault: z.boolean().optional(),
});

/** GET /api/addresses */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await repo("Address").find({
      where: { userId: req.user.id },
      order: { createdAt: "DESC" },
    });
    res.json({ ok: true, data: items });
  })
);

/** POST /api/addresses */
router.post(
  "/",
  validate({ body: addressSchema }),
  asyncHandler(async (req, res) => {
    const addresses = repo("Address");
    if (req.body.isDefault) {
      await addresses.update({ userId: req.user.id }, { isDefault: false });
    }
    const payload = { ...req.body, userId: req.user.id };
    if (hasCoords(req.body.lat, req.body.lng)) {
      payload.location = pointGeoJSON(req.body.lng, req.body.lat);
    }
    const created = await addresses.save(addresses.create(payload));
    res.status(201).json({ ok: true, data: created });
  })
);

/** PUT /api/addresses/:id */
router.put(
  "/:id",
  validate({ body: addressSchema.partial() }),
  asyncHandler(async (req, res) => {
    const addresses = repo("Address");
    const item = await addresses.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ ok: false, error: "Address not found." });
    if (req.body.isDefault) {
      await addresses.update({ userId: req.user.id }, { isDefault: false });
    }
    Object.assign(item, req.body);
    if (hasCoords(item.lat, item.lng)) item.location = pointGeoJSON(item.lng, item.lat);
    res.json({ ok: true, data: await addresses.save(item) });
  })
);

/** DELETE /api/addresses/:id */
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await repo("Address").delete({ id: req.params.id, userId: req.user.id });
    res.json({ ok: true });
  })
);

export default router;
