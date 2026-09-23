import { Router } from "express";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

/** GET /api/admin/stats — platform overview. */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const [customers, shops, partners, ordersCount] = await Promise.all([
      repo("User").count({ where: { role: "customer" } }).catch(() => 0),
      repo("Shop").count().catch(() => 0),
      repo("DeliveryPartner").count().catch(() => 0),
      repo("Order").count().catch(() => 0),
    ]);
    const revenue = await repo("Order")
      .createQueryBuilder("o")
      .select("COALESCE(SUM(o.totalAmount),0)", "revenue")
      .where("o.status NOT IN ('cancelled')")
      .getRawOne()
      .catch(() => ({ revenue: 0 }));
    res.json({
      ok: true,
      data: {
        customers,
        shops,
        deliveryPartners: partners,
        orders: ordersCount,
        revenue: Number(revenue?.revenue || 0),
      },
    });
  })
);

/** GET /api/admin/orders + GET /api/admin/orders/:id */
router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const [items, total] = await repo("Order").findAndCount({
      relations: { items: true, shop: true },
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

router.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const order = await repo("Order").findOne({
      where: { id: req.params.id },
      relations: { items: true, shop: true, customer: true },
    });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
    res.json({ ok: true, data: order });
  })
);

/** GET /api/admin/deliveries — all assignments. */
router.get(
  "/deliveries",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const [items, total] = await repo("DeliveryAssignment").findAndCount({
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/admin/shops */
router.get(
  "/shops",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const [items, total] = await repo("Shop").findAndCount({
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

export default router;
