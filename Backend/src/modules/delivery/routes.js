import { Router } from "express";
import { z } from "zod";
import { In } from "typeorm";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { DELIVERY_PARTNER_SHARE_PERCENT } from "../../common/utils/deliveryPricing.js";
import { AppDataSource, repo } from "../../config/db.js";
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

function deliveryOrderView(order) {
  const deliveryFee = Number(order.deliveryFee || 0);
  const storedPartnerShare = Number(order.deliveryPartnerShare);
  const deliveryPartnerShare = storedPartnerShare > 0
    ? storedPartnerShare
    : Math.round((deliveryFee * DELIVERY_PARTNER_SHARE_PERCENT) / 100);
  const nearMartShare = Number(order.nearMartShare) || deliveryFee - deliveryPartnerShare;

  return {
    ...order,
    deliveryPartnerShare,
    nearMartShare,
    shop: order.shop
      ? {
          name: order.shop.name,
          address: order.shop.address,
          city: order.shop.city,
          state: order.shop.state,
          phone: order.shop.phone,
        }
      : null,
    customer: order.customer
      ? { name: order.customer.name, phone: order.customer.phone }
      : null,
    address: order.address
      ? {
          fullName: order.address.fullName,
          phone: order.address.phone,
          line1: order.address.line1,
          line2: order.address.line2,
          city: order.address.city,
          state: order.address.state,
          pincode: order.address.pincode,
          lat: order.address.lat,
          lng: order.address.lng,
        }
      : null,
  };
}

/** GET /api/delivery/stats — deliveries, earnings, rating. */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    const approval = await repo("Approval").findOne({
      where: { applicantId: req.user.id, type: "delivery_partner" },
      order: { appliedAt: "DESC" },
    });
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
        applicationNotes: approval?.notes || "",
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
    const { step, data = {} } = req.body;
    if (step === "verification") {
      const saved = await AppDataSource.transaction(async (manager) => {
        const partners = manager.getRepository("DeliveryPartner");
        const approvals = manager.getRepository("Approval");
        const partner = await partners.findOne({ where: { userId: req.user.id } });
        if (!partner) throw Object.assign(new Error("Complete your delivery profile before submitting."), { status: 400 });
        if (partner.isApproved) {
          throw Object.assign(new Error("Your delivery account is already approved."), { status: 409 });
        }

        partner.onboardingStep = step;
        partner.applicationStatus = "submitted";
        const savedPartner = await partners.save(partner);

        const latestApproval = await approvals.findOne({
          where: { applicantId: req.user.id, type: "delivery_partner" },
          order: { appliedAt: "DESC" },
        });
        if (latestApproval?.status === "rejected") {
          latestApproval.status = "pending";
          latestApproval.notes = null;
          latestApproval.reviewedBy = null;
          latestApproval.reviewedAt = null;
          latestApproval.appliedAt = new Date();
          await approvals.save(latestApproval);
        } else if (!latestApproval) {
          await approvals.save(approvals.create({
            applicantId: req.user.id,
            type: "delivery_partner",
            status: "pending",
          }));
        }
        return savedPartner;
      });
      return res.json({ ok: true, data: saved });
    }

    const partners = repo("DeliveryPartner");
    const partner = await myPartner(req.user.id);
    if (step === "contact") partner.contactData = data;
    if (step === "identity") partner.identityData = data;
    if (step === "address") partner.addressData = data;
    partner.onboardingStep = step;
    const saved = await partners.save(partner);
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
    if (req.body.isOnline && !partner.isApproved) {
      return res.status(403).json({ ok: false, error: "Your delivery application must be approved before going online." });
    }
    partner.isOnline = req.body.isOnline;
    res.json({ ok: true, data: await partners.save(partner) });
  })
);

/** GET /api/delivery/available?lat&lng&radiusKm=10 — PostGIS nearby pickups. */
router.get(
  "/available",
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    if (!partner.isApproved) {
      return res.status(403).json({ ok: false, error: "Your delivery application must be approved to view available deliveries." });
    }
    const { lat, lng, radiusKm = 10, city } = req.query;
    const orders = repo("Order");
    if (lat && lng) {
      const radiusM = Number(radiusKm) * 1000;
      const nearby = await orders.query(
        `SELECT o.id, ST_Distance(s.location, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) AS distance_m
         FROM orders o
         JOIN shops s ON s.id = o.shop_id
         WHERE o.status = 'ready_for_pickup'
           AND s.location IS NOT NULL
           AND ST_DWithin(s.location, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3)
         ORDER BY distance_m ASC
         LIMIT 50`,
        [Number(lng), Number(lat), radiusM]
      );
      if (!nearby.length) return res.json({ ok: true, data: [] });
      const ordersById = new Map(
        (await orders.find({
          where: { id: In(nearby.map((row) => row.id)) },
          relations: { shop: true, customer: true, address: true, items: true },
        })).map((order) => [order.id, order])
      );
      return res.json({
        ok: true,
        data: nearby
          .map((row) => {
            const order = ordersById.get(row.id);
            return order
              ? { ...deliveryOrderView(order), pickupDistanceKm: Number(row.distance_m || 0) / 1000 }
              : null;
          })
          .filter(Boolean),
      });
    }
    const qb = orders.createQueryBuilder("o")
      .leftJoinAndSelect("o.shop", "shop")
      .leftJoinAndSelect("o.customer", "customer")
      .leftJoinAndSelect("o.address", "address")
      .leftJoinAndSelect("o.items", "items");
    qb.where("o.status = :s", { s: "ready_for_pickup" });
    if (city) qb.andWhere("shop.city = :city", { city });
    qb.orderBy("o.createdAt", "ASC").limit(50);
    res.json({ ok: true, data: (await qb.getMany()).map(deliveryOrderView) });
  })
);

/** GET /api/delivery/orders/:id — complete details for a pickup or own assignment. */
router.get(
  "/orders/:id",
  validate({ params: z.object({ id: z.string().uuid() }) }),
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    if (!partner.isApproved) {
      return res.status(403).json({ ok: false, error: "Your delivery application must be approved to view deliveries." });
    }
    const order = await repo("Order").findOne({
      where: { id: req.params.id },
      relations: { shop: true, customer: true, address: true, items: true },
    });
    if (!order) return res.status(404).json({ ok: false, error: "Delivery not found." });
    if (order.status !== "ready_for_pickup" && order.deliveryPartnerId !== req.user.id) {
      return res.status(404).json({ ok: false, error: "Delivery not found." });
    }
    const assignment = await repo("DeliveryAssignment").findOne({
      where: { orderId: order.id, partnerId: partner.id },
    });
    res.json({
      ok: true,
      data: {
        ...deliveryOrderView(order),
        assignment,
      },
    });
  })
);

/** GET /api/delivery/active */
router.get(
  "/active",
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    if (!partner.isApproved) {
      return res.status(403).json({ ok: false, error: "Your delivery application must be approved to access deliveries." });
    }
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
    const earning = deliveryOrderView(order).deliveryPartnerShare;
    const assignment = existing
      ? Object.assign(existing, {
          partnerId: partner.id,
          status: "assigned",
          partnerEarning: earning,
          distanceKm: order.deliveryDistance,
        })
      : assignments.create({
          orderId: order.id,
          partnerId: partner.id,
          status: "assigned",
          partnerEarning: earning,
          distanceKm: order.deliveryDistance,
        });
    await assignments.save(assignment);
    order.deliveryPartnerId = req.user.id;
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
    if (!partner.isApproved) {
      return res.status(403).json({ ok: false, error: "Your delivery application must be approved to update deliveries." });
    }
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

/** POST /api/delivery/documents - record an uploaded verification document. */
router.post(
  "/documents",
  validate({ body: z.object({ type: z.string().max(50), url: z.string().max(500) }) }),
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    const created = await AppDataSource.transaction(async (manager) => {
      const documents = manager.getRepository("DeliveryDocument");
      await documents.delete({ partnerId: partner.id, type: req.body.type });
      return documents.save(
        documents.create({ partnerId: partner.id, type: req.body.type, url: req.body.url })
      );
    });
    res.status(201).json({ ok: true, data: created });
  })
);

/** GET /api/delivery/documents - the partner's own uploaded documents. */
router.get(
  "/documents",
  asyncHandler(async (req, res) => {
    const partner = await myPartner(req.user.id);
    const documents = repo("DeliveryDocument");
    const items = await documents.find({
      where: { partnerId: partner.id },
      order: { createdAt: "ASC" },
    });
    res.json({ ok: true, data: items });
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
