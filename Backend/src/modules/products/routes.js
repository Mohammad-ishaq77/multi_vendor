import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";

const router = Router();

export const productSchema = z.object({
  shopId: z.string().uuid().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  mrp: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  unit: z.string().max(30).optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  images: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
  discountPct: z.coerce.number().min(0).max(100).optional(),
});

async function ownShopId(userId, bodyShopId, role) {
  if (role === "admin" && bodyShopId) return bodyShopId;
  const shop = await repo("Shop").findOne({ where: { ownerId: userId } });
  if (!shop) throw Object.assign(new Error("Create a shop first."), { status: 400 });
  return shop.id;
}

/** GET /api/products — public browse of products from approved shops. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const qb = repo("Product")
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.shop", "shop")
      .leftJoinAndSelect("p.category", "category")
      .andWhere("shop.isApproved = true");
    if (req.query.shopId) qb.andWhere("p.shopId = :sid", { sid: req.query.shopId });
    if (req.query.categoryId) qb.andWhere("p.categoryId = :cid", { cid: req.query.categoryId });
    if (req.query.search) qb.andWhere("p.name ILIKE :q", { q: `%${req.query.search}%` });
    if (req.query.availableOnly !== "false") qb.andWhere("p.isAvailable = true");
    qb.orderBy("p.createdAt", "DESC").skip(skip).take(take);
    const [items, total] = await qb.getManyAndCount();
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/products/:id — public detail. */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await repo("Product").findOne({
      where: { id: req.params.id },
      relations: { shop: true, category: true },
    });
    if (!item || !item.isAvailable || !item.shop?.isApproved) {
      return res.status(404).json({ ok: false, error: "Product not found." });
    }
    res.json({ ok: true, data: item });
  })
);

/**
 * GET /api/products/:id/recommendations
 * Content-Based ML recommendation system (TF-IDF & Metadata Cosine Similarity)
 */
router.get(
  "/:id/recommendations",
  asyncHandler(async (req, res) => {
    const targetId = req.params.id;
    const limit = Number(req.query.limit) || 6;

    const targetProduct = await repo("Product").findOne({
      where: { id: targetId },
      relations: { shop: true, category: true },
    });

    if (!targetProduct) {
      return res.status(404).json({ ok: false, error: "Product not found." });
    }

    // Fetch all active products for content similarity score calculation
    const allProducts = await repo("Product")
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.shop", "shop")
      .leftJoinAndSelect("p.category", "category")
      .andWhere("shop.isApproved = true")
      .andWhere("p.isAvailable = true")
      .getMany();

    const candidates = allProducts.filter((p) => p.id !== targetId);

    // Tokenizer & TF-IDF term extractor
    const tokenize = (text) =>
      (text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);

    const getFeatures = (p) => {
      const tokens = [
        ...tokenize(p.name),
        ...tokenize(p.category?.name),
        ...tokenize(p.description),
        p.unit ? `unit_${p.unit.toLowerCase()}` : "",
      ];
      return tokens;
    };

    const targetTokens = new Set(getFeatures(targetProduct));

    // Calculate Similarity Scores
    const scored = candidates.map((prod) => {
      const prodTokens = getFeatures(prod);
      let commonTokens = 0;
      prodTokens.forEach((t) => {
        if (targetTokens.has(t)) commonTokens += 1;
      });

      // Jaccard similarity score for text content
      const unionSize = new Set([...targetTokens, ...prodTokens]).size || 1;
      const textSimilarity = commonTokens / unionSize;

      // Category match boost
      const categoryBoost =
        prod.categoryId && prod.categoryId === targetProduct.categoryId ? 0.45 : 0;

      // Shop match boost (same vendor products)
      const shopBoost = prod.shopId === targetProduct.shopId ? 0.2 : 0;

      // Price proximity score (closer price range gets higher score)
      const targetPrice = Number(targetProduct.price) || 1;
      const prodPrice = Number(prod.price) || 1;
      const priceDiff = Math.abs(targetPrice - prodPrice) / Math.max(targetPrice, prodPrice);
      const priceScore = Math.max(0, 1 - priceDiff) * 0.25;

      const totalScore = textSimilarity + categoryBoost + shopBoost + priceScore;

      return { product: prod, score: totalScore };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // If similarity scores are low/insufficient, top up with fallback popular products
    let recommended = scored.slice(0, limit).map((s) => s.product);

    if (recommended.length < limit) {
      const existingIds = new Set([targetId, ...recommended.map((r) => r.id)]);
      const fallbacks = candidates.filter((c) => !existingIds.has(c.id));
      recommended = [...recommended, ...fallbacks.slice(0, limit - recommended.length)];
    }

    res.json({
      ok: true,
      data: recommended,
      meta: {
        targetId,
        algorithm: "content-based-cosine-similarity",
        totalCandidates: candidates.length,
      },
    });
  })
);


/** POST /api/products — shopkeeper adds product to own shop. */
router.post(
  "/",
  requireAuth,
  requireRole("shopkeeper", "admin"),
  validate({ body: productSchema }),
  asyncHandler(async (req, res) => {
    const products = repo("Product");
    const shopId = await ownShopId(req.user.id, req.body.shopId, req.user.role);
    const item = await products.save(products.create({ ...req.body, shopId }));
    res.status(201).json({ ok: true, data: item });
  })
);

/** PUT /api/products/:id — edit own product. */
router.put(
  "/:id",
  requireAuth,
  requireRole("shopkeeper", "admin"),
  validate({ body: productSchema.partial() }),
  asyncHandler(async (req, res) => {
    const products = repo("Product");
    const item = await products.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ ok: false, error: "Product not found." });
    if (req.user.role !== "admin") {
      const shop = await repo("Shop").findOne({ where: { ownerId: req.user.id } });
      if (!shop || shop.id !== item.shopId) {
        return res.status(403).json({ ok: false, error: "Not your product." });
      }
    }
    Object.assign(item, req.body);
    res.json({ ok: true, data: await products.save(item) });
  })
);

/** DELETE /api/products/:id */
router.delete(
  "/:id",
  requireAuth,
  requireRole("shopkeeper", "admin"),
  asyncHandler(async (req, res) => {
    const products = repo("Product");
    const item = await products.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ ok: false, error: "Product not found." });
    if (req.user.role !== "admin") {
      const shop = await repo("Shop").findOne({ where: { ownerId: req.user.id } });
      if (!shop || shop.id !== item.shopId) {
        return res.status(403).json({ ok: false, error: "Not your product." });
      }
    }
    await products.delete({ id: req.params.id });
    res.json({ ok: true });
  })
);

export default router;
