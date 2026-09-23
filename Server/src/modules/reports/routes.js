import { Router } from "express";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { repo } from "../../config/db.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

/** GET /api/reports — revenue, orders by status, top shops. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const orders = repo("Order");
    const revenue = await orders
      .createQueryBuilder("o")
      .select("COALESCE(SUM(o.totalAmount),0)", "revenue")
      .addSelect("COUNT(*)", "orders")
      .where("o.status NOT IN ('cancelled')")
      .getRawOne();
    const byStatus = await orders
      .createQueryBuilder("o")
      .select("o.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("o.status")
      .getRawMany();
    const topShops = await orders
      .createQueryBuilder("o")
      .select("o.shopId", "shopId")
      .addSelect("COALESCE(SUM(o.totalAmount),0)", "revenue")
      .addSelect("COUNT(*)", "orders")
      .where("o.status NOT IN ('cancelled')")
      .groupBy("o.shopId")
      .orderBy("revenue", "DESC")
      .limit(10)
      .getRawMany();
    const payments = await repo("Payment")
      .createQueryBuilder("p")
      .select("p.status", "status")
      .addSelect("COUNT(*)", "count")
      .addSelect("COALESCE(SUM(p.amount),0)", "amount")
      .groupBy("p.status")
      .getRawMany()
      .catch(() => []);
    res.json({
      ok: true,
      data: {
        revenue: Number(revenue?.revenue || 0),
        orders: Number(revenue?.orders || 0),
        byStatus,
        topShops,
        payments,
      },
    });
  })
);

export default router;
