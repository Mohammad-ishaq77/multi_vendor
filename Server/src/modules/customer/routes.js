import { Router } from "express";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { repo } from "../../config/db.js";

const router = Router();

/** GET /api/customer/stats — orders, cart count, wishlist count. */
router.get(
  "/stats",
  requireAuth,
  requireRole("customer", "admin"),
  asyncHandler(async (req, res) => {
    const uid = req.user.id;
    const [orders, cart, wishlist, addresses] = await Promise.all([
      repo("Order").count({ where: { customerId: uid } }).catch(() => 0),
      repo("CartItem").count({ where: { userId: uid } }).catch(() => 0),
      repo("WishlistItem").count({ where: { userId: uid } }).catch(() => 0),
      repo("Address").count({ where: { userId: uid } }).catch(() => 0),
    ]);
    res.json({ ok: true, data: { orders, cartCount: cart, wishlistCount: wishlist, addresses } });
  })
);

/** GET /api/profile + PUT /api/profile — current user's profile. */
router.get(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await repo("User").findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ ok: false, error: "User not found." });
    const { passwordHash, password, ...rest } = user;
    res.json({ ok: true, data: rest });
  })
);

router.put(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const users = repo("User");
    const user = await users.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ ok: false, error: "User not found." });
    const { name, phone, avatarUrl } = req.body || {};
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    const saved = await users.save(user);
    const { passwordHash, password, ...rest } = saved;
    res.json({ ok: true, data: rest });
  })
);

export default router;
