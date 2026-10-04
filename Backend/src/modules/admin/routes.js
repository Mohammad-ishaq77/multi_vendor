import { Router } from "express";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

/** GET /api/admin/stats — platform overview plus the aggregates the dashboard shows. */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const [customers, shops, partners, ordersCount] = await Promise.all([
      repo("User").count({ where: { role: "customer" } }).catch(() => 0),
      repo("Shop").count().catch(() => 0),
      repo("DeliveryPartner").count().catch(() => 0),
      repo("Order").count().catch(() => 0),
    ]);
    const orders = repo("Order");
    const revenue = await orders
      .createQueryBuilder("o")
      .select("COALESCE(SUM(o.totalAmount),0)", "revenue")
      .where("o.status NOT IN ('cancelled')")
      .getRawOne()
      .catch(() => ({ revenue: 0 }));

    // Aggregates are computed in SQL so the dashboard never has to derive totals
    // from a single page of rows.
    const [byStatus, topCustomers, topShops, partnerEarnings, thisMonth] = await Promise.all([
      orders
        .createQueryBuilder("o")
        .select("o.status", "status")
        .addSelect("COUNT(*)", "count")
        .groupBy("o.status")
        .getRawMany()
        .catch(() => []),
      orders
        .createQueryBuilder("o")
        .leftJoin("o.customer", "c")
        .select("o.customerId", "id")
        .addSelect("c.name", "name")
        .addSelect("c.email", "email")
        .addSelect("COUNT(o.id)", "orders")
        .addSelect("COALESCE(SUM(o.totalAmount),0)", "spent")
        .where("o.status NOT IN ('cancelled')")
        .groupBy("o.customerId")
        .addGroupBy("c.name")
        .addGroupBy("c.email")
        .orderBy("COALESCE(SUM(o.totalAmount),0)", "DESC")
        .limit(5)
        .getRawMany()
        .catch(() => []),
      orders
        .createQueryBuilder("o")
        .leftJoin("o.shop", "s")
        .select("o.shopId", "id")
        .addSelect("s.name", "name")
        .addSelect("COUNT(o.id)", "orders")
        .addSelect("COALESCE(SUM(o.totalAmount),0)", "revenue")
        .where("o.status NOT IN ('cancelled')")
        .groupBy("o.shopId")
        .addGroupBy("s.name")
        .orderBy("COALESCE(SUM(o.totalAmount),0)", "DESC")
        .limit(5)
        .getRawMany()
        .catch(() => []),
      orders
        .createQueryBuilder("o")
        .select("COALESCE(SUM(o.deliveryFee),0)", "earnings")
        .addSelect("COUNT(DISTINCT o.delivery_partner_id)", "partners")
        .where("o.status NOT IN ('cancelled') AND o.delivery_partner_id IS NOT NULL")
        .getRawOne()
        .catch(() => ({ earnings: 0, partners: 0 })),
      orders
        .createQueryBuilder("o")
        .select("COUNT(*)", "orders")
        .addSelect("COALESCE(SUM(o.totalAmount),0)", "revenue")
        .where("o.created_at >= date_trunc('month', now())")
        .andWhere("o.status NOT IN ('cancelled')")
        .getRawOne()
        .catch(() => ({ orders: 0, revenue: 0 })),
    ]);

    const num = (v) => Number(v || 0);
    res.json({
      ok: true,
      data: {
        customers,
        shops,
        deliveryPartners: partners,
        orders: ordersCount,
        revenue: num(revenue?.revenue),
        monthOrders: num(thisMonth?.orders),
        monthRevenue: num(thisMonth?.revenue),
        byStatus: byStatus.map((r) => ({ status: r.status, count: num(r.count) })),
        topCustomers: topCustomers.map((r) => ({
          id: r.id,
          name: r.name || "Customer",
          email: r.email || null,
          orders: num(r.orders),
          spent: num(r.spent),
        })),
        topShops: topShops.map((r) => ({
          id: r.id,
          name: r.name || "Shop",
          orders: num(r.orders),
          revenue: num(r.revenue),
        })),
        deliveryEarnings: {
          total: num(partnerEarnings?.earnings),
          partners: num(partnerEarnings?.partners),
        },
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
      relations: { documents: true },
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/admin/shops/:id/documents - real uploaded shop documents. */
router.get(
  "/shops/:id/documents",
  asyncHandler(async (req, res) => {
    const shops = repo("Shop");
    const shop = await shops.findOne({ where: { id: req.params.id } });
    if (!shop) return res.status(404).json({ ok: false, error: "Shop not found." });
    const documents = repo("ShopDocument");
    const items = await documents.find({
      where: { shopId: shop.id },
      order: { createdAt: "ASC" },
    });
    res.json({ ok: true, data: items });
  })
);

export default router;
