import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { hasCoords, pointWkt, slugify } from "../../common/utils/helpers.js";
import { repo } from "../../config/db.js";

const router = Router();

const shopSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  phone: z.string().max(15).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  deliveryTime: z.string().max(50).optional(),
  minOrder: z.coerce.number().optional(),
  shopImage: z.string().max(500).optional(),
  bannerImage: z.string().max(500).optional(),
  logoImage: z.string().max(500).optional(),
});

function withLocation(payload) {
  const out = { ...payload };
  if (hasCoords(payload.lat, payload.lng)) {
    out.location = () => pointWkt(payload.lng, payload.lat);
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
    if (!shop) return res.status(404).json({ ok: false, error: "Shop not found." });
    res.json({ ok: true, data: shop });
  })
);

/** GET /api/shops/:id/products — products of a shop (public). */
router.get(
  "/:id/products",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const [items, total] = await repo("Product").findAndCount({
      where: { shopId: req.params.id },
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
  validate({ body: shopSchema }),
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
    if (typeof shop.location === "function") shop.location = shop.location();
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
  validate({ body: shopSchema.partial() }),
  asyncHandler(async (req, res) => {
    const shops = repo("Shop");
    const shop = await shops.findOne({ where: { ownerId: req.user.id } });
    if (!shop) return res.status(404).json({ ok: false, error: "No shop yet." });
    const payload = withLocation(req.body);
    Object.assign(shop, payload);
    if (typeof shop.location === "function") shop.location = shop.location();
    res.json({ ok: true, data: await shops.save(shop) });
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
    body: z.object({
      isApproved: z.boolean().optional(),
      isOpen: z.boolean().optional(),
      name: z.string().min(2).max(150).optional(),
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
