import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { validate } from "../../common/middleware/validate.js";
import { repo } from "../../config/db.js";

const router = Router();
router.use(requireAuth);

/** GET /api/cart */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await repo("CartItem").find({
      where: { userId: req.user.id },
      relations: { product: true },
      order: { createdAt: "DESC" },
    });
    res.json({ ok: true, data: items });
  })
);

/** POST /api/cart/items */
router.post(
  "/items",
  validate({ body: z.object({ productId: z.string().uuid(), quantity: z.coerce.number().int().min(1).default(1) }) }),
  asyncHandler(async (req, res) => {
    const items = repo("CartItem");
    const product = await repo("Product").findOne({ where: { id: req.body.productId } });
    if (!product || !product.isAvailable) {
      return res.status(404).json({ ok: false, error: "Product unavailable." });
    }
    const existing = await items.findOne({
      where: { userId: req.user.id, productId: product.id },
    });
    if (existing) {
      existing.quantity += req.body.quantity;
      return res.json({ ok: true, data: await items.save(existing) });
    }
    const created = await items.save(
      items.create({
        userId: req.user.id,
        productId: product.id,
        shopId: product.shopId,
        quantity: req.body.quantity,
      })
    );
    res.status(201).json({ ok: true, data: created });
  })
);

/** PUT /api/cart/items/:id */
router.put(
  "/items/:id",
  validate({ body: z.object({ quantity: z.coerce.number().int().min(1) }) }),
  asyncHandler(async (req, res) => {
    const items = repo("CartItem");
    const item = await items.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ ok: false, error: "Cart item not found." });
    item.quantity = req.body.quantity;
    res.json({ ok: true, data: await items.save(item) });
  })
);

/** DELETE /api/cart/items/:id */
router.delete(
  "/items/:id",
  asyncHandler(async (req, res) => {
    await repo("CartItem").delete({ id: req.params.id, userId: req.user.id });
    res.json({ ok: true });
  })
);

export default router;
