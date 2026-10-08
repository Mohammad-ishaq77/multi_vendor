import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { AppDataSource, repo } from "../../config/db.js";
import { ORDER_STATUSES } from "../../entities/Order.js";
import { canTransition } from "../orders/status.js";
import { releaseOrderStock } from "../orders/stock.js";
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
    // Live aggregate: the cached Shop.rating column can drift from real reviews.
    const reviewAgg = await repo("Review")
      .createQueryBuilder("r")
      .select("COALESCE(AVG(r.rating),0)", "avg")
      .addSelect("COUNT(*)", "count")
      .where("r.shopId = :sid", { sid: shop.id })
      .getRawOne()
      .catch(() => null);
    res.json({
      ok: true,
      data: {
        revenue: Number(paid?.revenue || 0),
        orders: Number(paid?.count || 0),
        rating: Number(Number(reviewAgg?.avg || 0).toFixed(2)),
        totalReviews: Number(reviewAgg?.count || 0),
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

/** GET /api/shopkeeper/documents — the current shop owner's verification files. */
router.get(
  "/documents",
  asyncHandler(async (req, res) => {
    const shop = await repo("Shop").findOne({ where: { ownerId: req.user.id } });
    if (!shop) return res.json({ ok: true, data: [] });
    const documents = await repo("ShopDocument").find({
      where: { shopId: shop.id },
      order: { createdAt: "ASC" },
    });
    res.json({ ok: true, data: documents });
  })
);

/** POST /api/shopkeeper/approval/resubmit — return corrected application to the review queue. */
router.post(
  "/approval/resubmit",
  asyncHandler(async (req, res) => {
    const saved = await AppDataSource.transaction(async (manager) => {
      const shops = manager.getRepository("Shop");
      const shop = await shops.findOne({ where: { ownerId: req.user.id } });
      if (!shop) throw Object.assign(new Error("Create your shop before resubmitting."), { status: 400 });

      const documents = await manager.getRepository("ShopDocument").find({ where: { shopId: shop.id } });
      const requiredTypes = ["aadhaar", "pan", "license"];
      const uploadedTypes = new Set(documents.map((document) => document.type?.toLowerCase()));
      const missingTypes = requiredTypes.filter((type) => !uploadedTypes.has(type));
      if (missingTypes.length) {
        throw Object.assign(new Error(`Upload the required documents before resubmitting: ${missingTypes.join(", ")}.`), { status: 400 });
      }

      const approvals = manager.getRepository("Approval");
      const approval = await approvals.findOne({
        where: { applicantId: req.user.id, type: "shopkeeper" },
        order: { appliedAt: "DESC" },
      });
      if (approval?.status === "approved") {
        throw Object.assign(new Error("Your shop is already approved."), { status: 409 });
      }
      if (approval?.status === "pending") {
        throw Object.assign(new Error("Your application is already waiting for review."), { status: 409 });
      }

      shop.isApproved = false;
      shop.isOpen = false;
      await shops.save(shop);

      const resubmitted = approval || approvals.create({
        applicantId: req.user.id,
        type: "shopkeeper",
      });
      resubmitted.status = "pending";
      resubmitted.notes = null;
      resubmitted.reviewedBy = null;
      resubmitted.reviewedAt = null;
      resubmitted.appliedAt = new Date();
      return approvals.save(resubmitted);
    });
    res.json({ ok: true, data: saved });
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
    if (req.user.role !== "admin" && shop.ownerId !== req.user.id) {
      return res.status(403).json({ ok: false, error: "You can only update documents for your own shop." });
    }
    const created = await AppDataSource.transaction(async (manager) => {
      const docs = manager.getRepository("ShopDocument");
      await docs.delete({ shopId: shop.id, type: req.body.type });
      return docs.save(docs.create({ shopId: shop.id, type: req.body.type, url: req.body.url }));
    });
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
    const query = repo("Order")
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "item")
      .leftJoin("order.customer", "customer")
      .addSelect(["customer.id", "customer.name", "customer.phone"])
      .leftJoin("order.address", "address")
      .addSelect([
        "address.id",
        "address.fullName",
        "address.phone",
        "address.line1",
        "address.line2",
        "address.city",
        "address.state",
        "address.pincode",
      ])
      .where("order.shopId = :shopId", { shopId: shop.id });
    if (req.query.status) query.andWhere("order.status = :status", { status: req.query.status });
    const [items, total] = await query
      .orderBy("order.createdAt", "DESC")
      .skip(skip)
      .take(take)
      .getManyAndCount();
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/shopkeeper/orders/:id */
router.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const order = await repo("Order")
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "item")
      .leftJoin("order.customer", "customer")
      .addSelect(["customer.id", "customer.name", "customer.phone"])
      .leftJoin("order.address", "address")
      .addSelect([
        "address.id",
        "address.fullName",
        "address.phone",
        "address.line1",
        "address.line2",
        "address.city",
        "address.state",
        "address.pincode",
      ])
      .where("order.id = :orderId", { orderId: req.params.id })
      .andWhere("order.shopId = :shopId", { shopId: shop.id })
      .getOne();
    if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
    res.json({ ok: true, data: order });
  })
);

/** PATCH /api/shopkeeper/orders/:id/status — accept / advance. */
router.patch(
  "/orders/:id/status",
  validate({ body: z.object({ status: z.enum(ORDER_STATUSES) }) }),
  asyncHandler(async (req, res) => {
    const shop = await myShop(req.user.id);
    const orders = repo("Order");
    const order = await orders.findOne({ where: { id: req.params.id, shopId: shop.id } });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
    if (!canTransition(order.status, req.body.status)) {
      return res.status(400).json({ ok: false, error: `Cannot move ${order.status} to ${req.body.status}.` });
    }
    order.status = req.body.status;
    if (req.body.status === "cancelled") {
      order.cancelledAt = new Date();
      order.cancelReason = "Cancelled by shop";
      await releaseOrderStock(order.id);
    }
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
