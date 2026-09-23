import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { validate } from "../../common/middleware/validate.js";
import { repo } from "../../config/db.js";

const router = Router();
router.use(requireAuth);

/** GET /api/wishlist */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await repo("WishlistItem").find({
      where: { userId: req.user.id },
      relations: { product: true },
      order: { createdAt: "DESC" },
    });
    res.json({ ok: true, data: items });
  })
);

/** POST /api/wishlist */
router.post(
  "/",
  validate({ body: z.object({ productId: z.string().uuid() }) }),
  asyncHandler(async (req, res) => {
    const wishlist = repo("WishlistItem");
    const product = await repo("Product").findOne({ where: { id: req.body.productId } });
    if (!product) return res.status(404).json({ ok: false, error: "Product not found." });
    const existing = await wishlist.findOne({
      where: { userId: req.user.id, productId: product.id },
    });
    if (existing) return res.json({ ok: true, data: existing });
    const created = await wishlist.save(
      wishlist.create({ userId: req.user.id, productId: product.id })
    );
    res.status(201).json({ ok: true, data: created });
  })
);

/** DELETE /api/wishlist/:productId */
router.delete(
  "/:productId",
  asyncHandler(async (req, res) => {
    await repo("WishlistItem").delete({ userId: req.user.id, productId: req.params.productId });
    res.json({ ok: true });
  })
);

export default router;
