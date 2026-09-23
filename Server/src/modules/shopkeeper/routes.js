import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";
import { emitToUser } from "../../realtime/socket.js";

const router = Router();
router.use(requireAuth, requireRole("shopkeeper", "admin"));

async function myShop(userId) {
  const shop = await repo("Shop").findOne({ where: { ownerId: userId } });
  if (!shop) throw Object.assign(new Error("No shop yet."), { status: 404 });
  return shop;
}

/** GET /api/shopkeeper/stats — revenue, orders, rating. */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.role === "admin" && req.query.ownerId ? req.query.ownerId : req.user.id).catch(() => null);
    if (!shop) return res.json({ ok: true, data: { revenue: 0, orders: 0, rating: 0, products: 0 } });
    const orders = repo("Order");
    const paid = await orders
      .createQueryBuilder("o")
      .select("COALESCE(SUM(o.totalAmount),0)", "revenue")
      .addSelect("COUNT(*)", "count")
      .where("o.shopId = :sid", { sid: shop.id })
      .andWhere("o.status NOT IN ('cancelled')")
      .getRawOne();
    const products = await repo("Product").count({ where: { shopId: shop.id } });
    res.json({
      ok: true,
      data: {
        revenue: Number(paid?.revenue || 0),
        orders: Number(paid?.count || 0),
        rating: Number(shop.rating || 0),
        totalReviews: shop.totalReviews,
        products,
        isOpen: shop.isOpen,
        isApproved: shop.isApproved,
      },
    });
  })
);

/** GET /api/shopkeeper/status — onboarding/approval state. */
router.get(
  "/status",
  asyncHandler(async (req, res) => {
    const shop = await repo("Shop").findOne({ where: { ownerId: req.user.id } }).catch(() => null);
    const approval = await repo("Approval")
      .findOne({ where: { applicantId: req.user.id, type: "shopkeeper" }, order: { appliedAt: "DESC" } })
      .catch(() => null);
    res.json({ ok: true, data: { shop, approval } });
  })
);

/** PUT /api/shopkeeper/onboarding/step — persist wizard step (delegated to shops/documents). */
router.put(
  "/onboarding/step",
  validate({ body: z.object({ step: z.string().max(50), data: z.record(z.any()).optional() }) }),
  asyncHandler(async (req, res) => {
    res.json({ ok: true, data: { step: req.body.step, saved: true } });
  })
);

/** POST /api/shopkeeper/documents — record uploaded doc URLs. */
router.post(
  "/documents",
  validate({ body: z.object({ shopId: z.string().uuid().optional(), type: z.string().max(50), url: z.string().max(500) }) }),
  asyncHandler(async (req, res) => {
    const shop = req.body.shopId
      ? await repo("Shop").findOne({ where: { id: req.body.shopId } })
      : await myShop(req.user.id);
    if (!shop) return res.status(404).json({ ok: false, error: "Shop not found." });
    const docs = repo("ShopDocument");
    const created = await docs.save(docs.create({ shopId: shop.id, type: req.body.type, url: req.body.url }));
    res.status(201).json({ ok: true, data: created });
  })
);

/** GET /api/shopkeeper/products — own products. */
router.get(
  "/products",
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const { page, limit, skip, take } = getPagination(req.query);
    const [items, total] = await repo("Product").findAndCount({
      where: { shopId: shop.id },
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/shopkeeper/products/:id */
router.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const item = await repo("Product").findOne({ where: { id: req.params.id, shopId: shop.id } });
    if (!item) return res.status(404).json({ ok: false, error: "Product not found." });
    res.json({ ok: true, data: item });
  })
);

/** GET /api/shopkeeper/orders (+ ?status=ready_for_pickup queue). */
router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const { page, limit, skip, take } = getPagination(req.query);
    const where = { shopId: shop.id };
    if (req.query.status) where.status = req.query.status;
    const [items, total] = await repo("Order").findAndCount({
      where,
      relations: { items: true },
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/shopkeeper/orders/:id */
router.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const order = await repo("Order").findOne({
      where: { id: req.params.id, shopId: shop.id },
      relations: { items: true },
    });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
    res.json({ ok: true, data: order });
  })
);

/** PATCH /api/shopkeeper/orders/:id/status — accept / advance. */
router.patch(
  "/orders/:id/status",
  validate({ body: z.object({ status: z.string().max(30) }) }),
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const orders = repo("Order");
    const order = await orders.findOne({ where: { id: req.params.id, shopId: shop.id } });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
    order.status = req.body.status;
    const saved = await orders.save(order);
    emitToUser(order.customerId, "order:status_update", { orderId: order.id, status: order.status });
    res.json({ ok: true, data: saved });
  })
);

/** GET /api/shopkeeper/offers */
router.get(
  "/offers",
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const items = await repo("Offer").find({ where: { shopId: shop.id }, order: { createdAt: "DESC" } });
    res.json({ ok: true, data: items });
  })
);

/** POST /api/shopkeeper/offers */
router.post(
  "/offers",
  validate({
    body: z.object({
      title: z.string().max(150).optional(),
      description: z.string().optional(),
      discountType: z.enum(["flat", "percentage"]).optional(),
      discountValue: z.coerce.number().optional(),
      minOrder: z.coerce.number().optional(),
      maxDiscount: z.coerce.number().optional(),
      code: z.string().max(30).optional(),
      startsAt: z.string().optional(),
      expiresAt: z.string().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const offers = repo("Offer");
    const created = await offers.save(offers.create({ ...req.body, shopId: shop.id }));
    res.status(201).json({ ok: true, data: created });
  })
);

/** GET /api/shopkeeper/earnings — revenue overview. */
router.get(
  "/earnings",
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const rows = await repo("Order")
      .createQueryBuilder("o")
      .select("DATE(o.createdAt)", "day")
      .addSelect("COALESCE(SUM(o.totalAmount),0)", "revenue")
      .addSelect("COUNT(*)", "orders")
      .where("o.shopId = :sid", { sid: shop.id })
      .andWhere("o.status NOT IN ('cancelled')")
      .andWhere("o.createdAt >= NOW() - INTERVAL '30 days'")
      .groupBy("day")
      .orderBy("day", "ASC")
      .getRawMany();
    const totals = rows.reduce(
      (acc, r) => ({ revenue: acc.revenue + Number(r.revenue), orders: acc.orders + Number(r.orders) }),
      { revenue: 0, orders: 0 }
    );
    res.json({ ok: true, data: { ...totals, daily: rows } });
  })
);

/** GET /api/shopkeeper/reviews */
router.get(
  "/reviews",
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const { page, limit, skip, take } = getPagination(req.query);
    const [items, total] = await repo("Review").findAndCount({
      where: { shopId: shop.id },
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/shopkeeper/profile + PUT /api/shopkeeper/profile (user record). */
router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const user = await repo("User").findOne({ where: { id: req.user.id } });
    const { passwordHash, password, ...rest } = user || {};
    res.json({ ok: true, data: rest });
  })
);

router.put(
  "/profile",
  validate({
    body: z.object({
      name: z.string().min(2).max(100).optional(),
      phone: z.string().max(15).optional(),
      avatarUrl: z.string().max(500).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const users = repo("User");
    const user = await users.findOne({ where: { id: req.user.id } });
    Object.assign(user, req.body);
    const saved = await users.save(user);
    const { passwordHash, password, ...rest } = saved;
    res.json({ ok: true, data: rest });
  })
);

export default router;
