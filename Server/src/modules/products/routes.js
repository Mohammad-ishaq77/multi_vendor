import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";

const router = Router();

const productSchema = z.object({
  shopId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  mrp: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  unit: z.string().max(30).optional(),
  imageUrl: z.string().max(500).optional(),
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

/** GET /api/products — public browse. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const qb = repo("Product").createQueryBuilder("p").leftJoinAndSelect("p.shop", "shop");
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
      relations: { shop: true },
    });
    if (!item) return res.status(404).json({ ok: false, error: "Product not found." });
    res.json({ ok: true, data: item });
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
