import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";

const router = Router();

/** GET /api/reviews?shopId=&productId= - public. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {};
    if (req.query.shopId) where.shopId = req.query.shopId;
    if (req.query.productId) where.productId = req.query.productId;
    const [items, total] = await repo("Review").findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** POST /api/reviews - customer writes review; aggregates shop/product rating. */
router.post(
  "/",
  requireAuth,
  requireRole("customer", "admin"),
  validate({
    body: z.object({
      shopId: z.string().uuid().optional(),
      productId: z.string().uuid().optional(),
      orderId: z.string().uuid().optional(),
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().max(1000).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { rating, comment, orderId } = req.body;
    let { shopId, productId } = req.body;

    // An order proves the purchase, so shop (and product) are derived from it
    // instead of trusting whatever the client sends.
    if (orderId) {
      const order = await repo("Order").findOne({ where: { id: orderId }, relations: { items: true } });
      if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
      if (req.user.role !== "admin" && order.customerId !== req.user.id) {
        return res.status(403).json({ ok: false, error: "Forbidden." });
      }
      if (!["delivered", "completed"].includes(order.status)) {
        return res.status(400).json({ ok: false, error: "Only delivered orders can be reviewed." });
      }
      shopId = order.shopId;
      if (!productId) productId = order.items?.[0]?.productId || undefined;
    }
    if (!shopId) {
      return res.status(400).json({
        ok: false,
        error: "Validation failed.",
        issues: [{ path: "shopId", message: "Required" }],
      });
    }
    if (productId) {
      const product = await repo("Product").findOne({ where: { id: productId } });
      if (!product || product.shopId !== shopId) {
        return res.status(400).json({ ok: false, error: "Product does not belong to this shop." });
      }
      const duplicateWhere = { reviewerId: req.user.id, productId };
      if (orderId) duplicateWhere.orderId = orderId;
      const existing = await repo("Review").findOne({ where: duplicateWhere });
      if (existing) {
        return res.status(409).json({ ok: false, error: "You already reviewed this product." });
      }
    }

    const reviews = repo("Review");
    const created = await reviews.save(
      reviews.create({
        shopId,
        productId: productId || null,
        orderId: orderId || null,
        rating,
        comment,
        reviewerId: req.user.id,
      })
    );
    // Recompute shop aggregate
    try {
      const agg = await reviews
        .createQueryBuilder("r")
        .select("AVG(r.rating)", "avg")
        .addSelect("COUNT(*)", "count")
        .where("r.shopId = :sid", { sid: shopId })
        .getRawOne();
      const shops = repo("Shop");
      const shop = await shops.findOne({ where: { id: shopId } });
      if (shop) {
        shop.rating = Number(Number(agg?.avg || 0).toFixed(2));
        shop.totalReviews = Number(agg?.count || 0);
        await shops.save(shop);
      }
      if (productId) {
        const pAgg = await reviews
          .createQueryBuilder("r")
          .select("AVG(r.rating)", "avg")
          .addSelect("COUNT(*)", "count")
          .where("r.productId = :pid", { pid: productId })
          .getRawOne();
        const products = repo("Product");
        const product = await products.findOne({ where: { id: productId } });
        if (product) {
          product.rating = Number(Number(pAgg?.avg || 0).toFixed(2));
          product.reviewCount = Number(pAgg?.count || 0);
          await products.save(product);
        }
      }
    } catch { /* aggregate best-effort */ }
    res.status(201).json({ ok: true, data: created });
  })
);

export default router;
