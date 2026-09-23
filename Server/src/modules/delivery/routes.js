import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";
import { emitToRole, emitToUser } from "../../realtime/socket.js";

const router = Router();
router.use(requireAuth, requireRole("delivery", "admin"));

async function myPartner(userId) {
  let partner = await repo("DeliveryPartner").findOne({ where: { userId } });
  if (!partner) {
    const partners = repo("DeliveryPartner");
    partner = await partners.save(partners.create({ userId }));
  }
  return partner;
}

/** GET /api/delivery/stats — deliveries, earnings, rating. */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    res.json({
      ok: true,
      data: {
        totalDeliveries: partner.totalDeliveries,
        completedDeliveries: partner.completedDeliveries,
        todayDeliveries: partner.todayDeliveries,
        totalEarnings: Number(partner.totalEarnings),
        todayEarnings: Number(partner.todayEarnings),
        rating: Number(partner.rating),
        isOnline: partner.isOnline,
        isApproved: partner.isApproved,
        applicationStatus: partner.applicationStatus,
        onboardingStep: partner.onboardingStep,
      },
    });
  })
);

/** POST /api/delivery/onboarding — save a step payload. */
router.post(
  "/onboarding",
  validate({
    body: z.object({
      step: z.enum(["guidelines", "contact", "identity", "address", "documents", "verification"]),
      data: z.record(z.any()).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const partners = repo("DeliveryPartner");
    const partner = await myPartner(req.user.id);
    const { step, data = {} } = req.body;
    if (step === "contact") partner.contactData = data;
    if (step === "identity") partner.identityData = data;
    if (step === "address") partner.addressData = data;
    partner.onboardingStep = step;
    if (step === "verification") partner.applicationStatus = "submitted";
    const saved = await partners.save(partner);
    if (step === "verification") {
      try {
        const approvals = repo("Approval");
        await approvals.save(
          approvals.create({ applicantId: req.user.id, type: "delivery_partner", status: "pending" })
        );
      } catch { /* best-effort */ }
    }
    res.json({ ok: true, data: saved });
  })
);

/** PUT /api/delivery/onboarding/step — same as POST (frontend uses both). */
router.put(
  "/onboarding/step",
  validate({ body: z.object({ step: z.string().max(50), data: z.record(z.any()).optional() }) }),
  asyncHandler(async (req, res) => {
    const partners = repo("DeliveryPartner");
    const partner = await myPartner(req.user.id);
    partner.onboardingStep = req.body.step;
    Object.assign(partner, req.body.data || {});
    res.json({ ok: true, data: await partners.save(partner) });
  })
);

/** PATCH /api/delivery/status — online/offline toggle. */
router.patch(
  "/status",
  validate({ body: z.object({ isOnline: z.boolean() }) }),
  asyncHandler(async (req, res) => {
    const partners = repo("DeliveryPartner");
    const partner = await myPartner(req.user.id);
    partner.isOnline = req.body.isOnline;
    res.json({ ok: true, data: await partners.save(partner) });
  })
);

/** GET /api/delivery/available?lat&lng&radiusKm=10 — PostGIS nearby pickups. */
router.get(
  "/available",
  asyncHandler(async (req, res) => {
    const { lat, lng, radiusKm = 10, city } = req.query;
    const orders = repo("Order");
    if (lat && lng) {
      const radiusM = Number(radiusKm) * 1000;
      const items = await orders.query(
        `SELECT o.*, ST_Distance(s.location, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) AS distance_m
         FROM orders o
         JOIN shops s ON s.id = o.shop_id
         WHERE o.status = 'ready_for_pickup'
           AND s.location IS NOT NULL
           AND ST_DWithin(s.location, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3)
         ORDER BY distance_m ASC
         LIMIT 50`,
        [Number(lng), Number(lat), radiusM]
      );
      return res.json({ ok: true, data: items });
    }
    const qb = orders.createQueryBuilder("o").leftJoinAndSelect("o.shop", "shop");
    qb.where("o.status = :s", { s: "ready_for_pickup" });
    if (city) qb.andWhere("shop.city = :city", { city });
    qb.orderBy("o.createdAt", "ASC").limit(50);
    res.json({ ok: true, data: await qb.getMany() });
  })
);

/** GET /api/delivery/active */
router.get(
  "/active",
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    const assignment = await repo("DeliveryAssignment").findOne({
      where: [
        { partnerId: partner.id, status: "assigned" },
        { partnerId: partner.id, status: "picked_up" },
        { partnerId: partner.id, status: "out_for_delivery" },
      ],
      order: { createdAt: "DESC" },
    });
    if (!assignment) return res.json({ ok: true, data: null });
    const order = await repo("Order").findOne({
      where: { id: assignment.orderId },
      relations: { items: true, shop: true },
    });
    res.json({ ok: true, data: { assignment, order } });
  })
);

/** POST /api/delivery/accept/:orderId */
router.post(
  "/accept/:orderId",
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    if (!partner.isApproved) {
      return res.status(403).json({ ok: false, error: "Delivery account not approved yet." });
    }
    const orders = repo("Order");
    const order = await orders.findOne({ where: { id: req.params.orderId } });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
    if (order.status !== "ready_for_pickup") {
      return res.status(400).json({ ok: false, error: "Order is not ready for pickup." });
    }
    const assignments = repo("DeliveryAssignment");
    const existing = await assignments.findOne({ where: { orderId: order.id } }).catch(() => null);
    if (existing?.partnerId) {
      return res.status(409).json({ ok: false, error: "Already accepted by another partner." });
    }
    const earning = 30;
    const assignment = existing
      ? Object.assign(existing, { partnerId: partner.id, status: "assigned", partnerEarning: earning })
      : assignments.create({ orderId: order.id, partnerId: partner.id, status: "assigned", partnerEarning: earning });
    await assignments.save(assignment);
    order.deliveryPartnerId = req.user.id;
    order.status = "out_for_delivery";
    await orders.save(order);
    emitToUser(order.customerId, "delivery:status_update", { orderId: order.id, status: order.status });
    emitToRole("shopkeeper", "delivery:accepted", { orderId: order.id, partnerId: partner.id });
    res.json({ ok: true, data: { assignment, order } });
  })
);

/** PATCH /api/delivery/orders/:id/status — picked_up → out_for_delivery → delivered. */
router.patch(
  "/orders/:id/status",
  validate({ body: z.object({ status: z.enum(["picked_up", "out_for_delivery", "delivered", "failed"]) }) }),
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    const assignments = repo("DeliveryAssignment");
    const assignment = await assignments.findOne({
      where: { orderId: req.params.id, partnerId: partner.id },
    });
    if (!assignment) return res.status(404).json({ ok: false, error: "Assignment not found." });
    const order = await repo("Order").findOne({ where: { id: req.params.id } });
    assignment.status = req.body.status;
    if (req.body.status === "picked_up") assignment.pickedUpAt = new Date();
    if (req.body.status === "delivered") {
      assignment.deliveredAt = new Date();
      if (order) {
        order.status = "delivered";
        order.deliveredAt = new Date();
        await repo("Order").save(order);
      }
      const partners = repo("DeliveryPartner");
      partner.completedDeliveries += 1;
      partner.totalDeliveries += 1;
      partner.todayDeliveries += 1;
      partner.totalEarnings = Number(partner.totalEarnings) + Number(assignment.partnerEarning || 0);
      partner.todayEarnings = Number(partner.todayEarnings) + Number(assignment.partnerEarning || 0);
      await partners.save(partner);
    } else if (order) {
      order.status = req.body.status === "failed" ? order.status : "out_for_delivery";
      await repo("Order").save(order);
    }
    const saved = await assignments.save(assignment);
    if (order) emitToUser(order.customerId, "delivery:status_update", { orderId: order.id, status: order.status });
    res.json({ ok: true, data: saved });
  })
);

/** GET /api/delivery/history */
router.get(
  "/history",
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    const { page, limit, skip, take } = getPagination(req.query);
    const [items, total] = await repo("DeliveryAssignment").findAndCount({
      where: { partnerId: partner.id },
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/delivery/earnings — 7-day chart + totals. */
router.get(
  "/earnings",
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    const rows = await repo("DeliveryAssignment")
      .createQueryBuilder("a")
      .select("DATE(a.deliveredAt)", "day")
      .addSelect("COALESCE(SUM(a.partnerEarning),0)", "earnings")
      .addSelect("COUNT(*)", "deliveries")
      .where("a.partnerId = :pid", { pid: partner.id })
      .andWhere("a.status = 'delivered'")
      .andWhere("a.deliveredAt >= NOW() - INTERVAL '7 days'")
      .groupBy("day")
      .orderBy("day", "ASC")
      .getRawMany();
    res.json({
      ok: true,
      data: {
        totalEarnings: Number(partner.totalEarnings),
        todayEarnings: Number(partner.todayEarnings),
        weekly: rows,
      },
    });
  })
);

/** GET /api/delivery/profile + PUT /api/delivery/profile */
router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    res.json({ ok: true, data: partner });
  })
);

router.put(
  "/profile",
  validate({
    body: z.object({
      vehicleType: z.string().max(50).optional(),
      vehicleNumber: z.string().max(30).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const partners = repo("DeliveryPartner");
    const partner = await myPartner(req.user.id);
    Object.assign(partner, req.body);
    res.json({ ok: true, data: await partners.save(partner) });
  })
);

/** GET /api/delivery/notifications */
router.get(
  "/notifications",
  asyncHandler(async (req, res) => {
    const items = await repo("Notification").find({
      where: { userId: req.user.id },
      order: { createdAt: "DESC" },
      take: 50,
    });
    res.json({ ok: true, data: items });
  })
);

export default router;
