import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";

const router = Router();

/** GET /api/reviews?shopId=&productId= — public. */
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

/** POST /api/reviews — customer writes review; aggregates shop/product rating. */
router.post(
  "/",
  requireAuth,
  requireRole("customer", "admin"),
  validate({
    body: z.object({
      shopId: z.string().uuid(),
      productId: z.string().uuid().optional(),
      orderId: z.string().uuid().optional(),
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const reviews = repo("Review");
    const created = await reviews.save(
      reviews.create({ ...req.body, reviewerId: req.user.id })
    );
    // Recompute shop aggregate
    try {
      const agg = await reviews
        .createQueryBuilder("r")
        .select("AVG(r.rating)", "avg")
        .addSelect("COUNT(*)", "count")
        .where("r.shopId = :sid", { sid: req.body.shopId })
        .getRawOne();
      const shops = repo("Shop");
      const shop = await shops.findOne({ where: { id: req.body.shopId } });
      if (shop) {
        shop.rating = Number(Number(agg?.avg || 0).toFixed(2));
        shop.totalReviews = Number(agg?.count || 0);
        await shops.save(shop);
      }
      if (req.body.productId) {
        const pAgg = await reviews
          .createQueryBuilder("r")
          .select("AVG(r.rating)", "avg")
          .addSelect("COUNT(*)", "count")
          .where("r.productId = :pid", { pid: req.body.productId })
          .getRawOne();
        const products = repo("Product");
        const product = await products.findOne({ where: { id: req.body.productId } });
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
