import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { hasCoords, pointGeoJSON, slugify } from "../../common/utils/helpers.js";
import { repo } from "../../config/db.js";

const router = Router();

const shopSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  phone: z.string().max(15).nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  pincode: z.string().max(10).nullable().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  openingTime: z.string().nullable().optional(),
  closingTime: z.string().nullable().optional(),
  deliveryTime: z.string().max(50).nullable().optional(),
  minOrder: z.coerce.number().min(0).optional(),
  shopImage: z.string().max(500).nullable().optional(),
  bannerImage: z.string().max(500).nullable().optional(),
  logoImage: z.string().max(500).nullable().optional(),
});

const createShopSchema = shopSchema.extend({
  minOrder: z.coerce.number().min(0),
});

const updateShopSchema = shopSchema.partial().superRefine((body, context) => {
  if ((body.lat === undefined) !== (body.lng === undefined)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Shop latitude and longitude must be updated together.",
    });
  }
});

function withLocation(payload) {
  const out = { ...payload };
  if (hasCoords(payload.lat, payload.lng)) {
    out.location = pointGeoJSON(payload.lng, payload.lat);
  }
  return out;
}

/** GET /api/shops — public browse with filters. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const qb = repo("Shop").createQueryBuilder("shop").leftJoinAndSelect("shop.category", "category");
    if (req.query.categoryId) qb.andWhere("shop.categoryId = :cid", { cid: req.query.categoryId });
    if (req.query.city) qb.andWhere("LOWER(shop.city) = LOWER(:city)", { city: req.query.city });
    if (req.query.search) qb.andWhere("shop.name ILIKE :q", { q: `%${req.query.search}%` });
    if (req.query.approvedOnly !== "false") qb.andWhere("shop.isApproved = true");
    qb.orderBy("shop.rating", "DESC").skip(skip).take(take);
    const [items, total] = await qb.getManyAndCount();
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/shops/my — shopkeeper's own shop. */
router.get(
  "/my",
  requireAuth,
  requireRole("shopkeeper", "admin"),
  asyncHandler(async (req, res) => {
    const shop = await repo("Shop").findOne({ where: { ownerId: req.user.id } });
    if (!shop) return res.status(404).json({ ok: false, error: "No shop yet." });
    res.json({ ok: true, data: shop });
  })
);

/** GET /api/shops/:id — public detail. */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const shop = await repo("Shop").findOne({
      where: { id: req.params.id },
      relations: { category: true },
    });
    if (!shop || !shop.isApproved) return res.status(404).json({ ok: false, error: "Shop not found." });
    res.json({ ok: true, data: shop });
  })
);

/** GET /api/shops/:id/products — products of an approved shop (public). */
router.get(
  "/:id/products",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const shop = await repo("Shop").findOne({ where: { id: req.params.id, isApproved: true } });
    if (!shop) return res.status(404).json({ ok: false, error: "Shop not found." });
    const [items, total] = await repo("Product").findAndCount({
      where: { shopId: req.params.id, isAvailable: true },
      relations: { shop: true, category: true },
      skip,
      take,
      order: { createdAt: "DESC" },
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** POST /api/shops — shopkeeper onboarding: create shop. */
router.post(
  "/",
  requireAuth,
  requireRole("shopkeeper", "admin"),
  validate({ body: createShopSchema }),
  asyncHandler(async (req, res) => {
    const shops = repo("Shop");
    const existing = await shops.findOne({ where: { ownerId: req.user.id } });
    if (existing && req.user.role !== "admin") {
      return res.status(409).json({ ok: false, error: "You already have a shop." });
    }
    const payload = withLocation(req.body);
    const shop = shops.create({
      ...payload,
      ownerId: req.user.role === "admin" && req.body.ownerId ? req.body.ownerId : req.user.id,
      slug: `${slugify(req.body.name)}-${Date.now().toString(36)}`,
    });
    const saved = await shops.save(shop);
    // Approval request for admin queue
    try {
      const approvals = repo("Approval");
      await approvals.save(
        approvals.create({ applicantId: saved.ownerId, type: "shopkeeper", status: "pending" })
      );
    } catch { /* approvals table may be unavailable */ }
    res.status(201).json({ ok: true, data: saved });
  })
);

/** PUT /api/shops/my — edit own shop. */
router.put(
  "/my",
  requireAuth,
  requireRole("shopkeeper", "admin"),
  validate({ body: updateShopSchema }),
  asyncHandler(async (req, res) => {
    const shops = repo("Shop");
    const shop = await shops.findOne({ where: { ownerId: req.user.id } });
    if (!shop) return res.status(404).json({ ok: false, error: "No shop yet." });
    const payload = withLocation(req.body);
    Object.assign(shop, payload);
    const saved = await shops.save(shop);
    const refreshed = await shops.findOne({
      where: { id: saved.id },
      relations: { category: true },
    });
    res.json({ ok: true, data: refreshed || saved });
  })
);

/** PATCH /api/shops/my/status — open/close toggle. */
router.patch(
  "/my/status",
  requireAuth,
  requireRole("shopkeeper", "admin"),
  validate({ body: z.object({ isOpen: z.boolean() }) }),
  asyncHandler(async (req, res) => {
    const shops = repo("Shop");
    const shop = await shops.findOne({ where: { ownerId: req.user.id } });
    if (!shop) return res.status(404).json({ ok: false, error: "No shop yet." });
    shop.isOpen = req.body.isOpen;
    res.json({ ok: true, data: await shops.save(shop) });
  })
);

/** PATCH /api/shops/:id — admin moderation (approve etc.). */
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate({
    body: z
      .object({
        isApproved: z.boolean().optional(),
        isOpen: z.boolean().optional(),
        name: z.string().min(2).max(150).optional(),
      })
      .refine((body) => Object.keys(body).length > 0, {
        message: "Provide at least one field to update.",
      }),
  }),
  asyncHandler(async (req, res) => {
    const shops = repo("Shop");
    const shop = await shops.findOne({ where: { id: req.params.id } });
    if (!shop) return res.status(404).json({ ok: false, error: "Shop not found." });
    Object.assign(shop, req.body);
    res.json({ ok: true, data: await shops.save(shop) });
  })
);

export default router;
