import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { calculateDeliveryDetails } from "../../common/utils/deliveryPricing.js";
import { DELIVERY_MESSAGES, RoadDistanceError } from "../../common/utils/roadDistance.js";
import { repo } from "../../config/db.js";
import { ORDER_STATUSES } from "../../entities/Order.js";
import { canTransition } from "./status.js";
import { releaseOrderStock } from "./stock.js";
import { emitToRole, emitToUser } from "../../realtime/socket.js";

const router = Router();
router.use(requireAuth);

const createOrderSchema = z.object({
  shopId: z.string().uuid(),
  addressId: z.string().uuid(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.coerce.number().int().min(1) })).min(1),
  paymentMethod: z.string().max(50).optional(),
  notes: z.string().optional(),
  offerCode: z.string().max(30).optional(),
});

/** POST /api/orders — checkout + place order. */
router.post(
  "/",
  requireRole("customer", "admin"),
  validate({ body: createOrderSchema }),
  asyncHandler(async (req, res) => {
    const products = repo("Product");
    const orders = repo("Order");
    const orderItems = repo("OrderItem");

    const shop = await repo("Shop").findOne({ where: { id: req.body.shopId } });
    if (!shop || !shop.isApproved) {
      return res.status(404).json({ ok: false, error: "Shop unavailable." });
    }

    let subtotal = 0;
    const lines = [];
    const foreignShop = new Set();
    for (const line of req.body.items) {
      const product = await products.findOne({ where: { id: line.productId } });
      if (!product || !product.isAvailable) {
        return res.status(400).json({ ok: false, error: `Product ${line.productId} unavailable.` });
      }
      if (product.shopId !== shop.id) foreignShop.add(product.shopId);
      if (product.stock < line.quantity) {
        return res.status(400).json({ ok: false, error: `Insufficient stock for ${product.name}.` });
      }
      const price = Number(product.price);
      subtotal += price * line.quantity;
      lines.push({ product, quantity: line.quantity, price });
    }
    if (foreignShop.size) {
      return res.status(400).json({
        ok: false,
        error: "Your cart has products from more than one shop. Place a separate order for each shop.",
      });
    }
    const minimumOrder = Number(shop.minOrder) || 0;
    const minimumOrderCents = Math.round(minimumOrder * 100);
    const subtotalCents = Math.round(subtotal * 100);
    if (subtotalCents < minimumOrderCents) {
      const remaining = ((minimumOrderCents - subtotalCents) / 100).toFixed(2);
      return res.status(400).json({
        ok: false,
        error: `Orders from ${shop.name} start at ₹${minimumOrder.toFixed(2)}. Add ₹${remaining} more to place your order.`,
      });
    }

    const address = await repo("Address").findOne({ where: { id: req.body.addressId } });
    if (!address || (req.user.role !== "admin" && address.userId !== req.user.id)) {
      return res.status(400).json({ ok: false, error: "Select a saved delivery address." });
    }

    // Offer discount (best-effort)
    let discount = 0;
    if (req.body.offerCode) {
      const offer = await repo("Offer").findOne({
        where: { code: req.body.offerCode, shopId: shop.id, isActive: true },
      });
      if (offer) {
        const value = Number(offer.discountValue || 0);
        discount =
          offer.discountType === "percentage"
            ? Math.min((subtotal * value) / 100, Number(offer.maxDiscount || subtotal))
            : Math.min(value, subtotal);
      }
    }

    let pricing;
    try {
      pricing = await calculateDeliveryDetails(shop, address);
    } catch (err) {
      const known = err instanceof RoadDistanceError;
      return res.status(known ? err.status : 502).json({
        ok: false,
        error: known ? err.message : DELIVERY_MESSAGES.ROUTING_FAILED,
      });
    }

    if (!pricing.deliveryAvailable) {
      return res.status(400).json({ ok: false, error: pricing.message });
    }

    const { deliveryFee, nearMartShare, deliveryPartnerShare } = pricing;
    const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

    const order = await orders.save(
      orders.create({
        customerId: req.user.id,
        shopId: shop.id,
        addressId: req.body.addressId,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: req.body.paymentMethod || "razorpay",
        subtotal,
        deliveryFee,
        deliveryDistance: pricing.distanceKm,
        nearMartShare,
        deliveryPartnerShare,
        shopLat: shop.lat,
        shopLng: shop.lng,
        customerLat: address.lat,
        customerLng: address.lng,
        discount,
        totalAmount,
        notes: req.body.notes,
      })
    );

    for (const line of lines) {
      await orderItems.save(
        orderItems.create({
          orderId: order.id,
          productId: line.product.id,
          name: line.product.name,
          price: line.price,
          quantity: line.quantity,
          imageUrl: line.product.imageUrl,
          subtotal: line.price * line.quantity,
        })
      );
      line.product.stock -= line.quantity;
      await products.save(line.product);
    }

    // Clear ordered products from cart
    try {
      const ids = req.body.items.map((i) => i.productId);
      await repo("CartItem").createQueryBuilder().delete()
        .where("user_id = :uid", { uid: req.user.id })
        .andWhere("product_id IN (:...ids)", { ids })
        .execute();
    } catch { /* non-fatal */ }

    const full = await orders.findOne({ where: { id: order.id }, relations: { items: true } });
    emitToRole("shopkeeper", "order:new", { orderId: order.id, shopId: shop.id });
    res.status(201).json({ ok: true, data: full });
  })
);

const quoteQuerySchema = z.object({
  shopId: z.string().uuid(),
  addressId: z.string().uuid(),
});

/**
 * GET /api/orders/delivery-quote?shopId=&addressId= — real road distance +
 * delivery fee for checkout. Same server-side pricing as order creation, so
 * the checkout preview can never disagree with what the order charges.
 */
router.get(
  "/delivery-quote",
  validate({ query: quoteQuerySchema }),
  asyncHandler(async (req, res) => {
    const shop = await repo("Shop").findOne({ where: { id: req.query.shopId } });
    if (!shop || !shop.isApproved) {
      return res.status(404).json({ ok: false, error: "Shop unavailable." });
    }

    const address = await repo("Address").findOne({ where: { id: req.query.addressId } });
    if (!address || (req.user.role !== "admin" && address.userId !== req.user.id)) {
      return res.status(400).json({ ok: false, error: "Select a saved delivery address." });
    }

    let details;
    try {
      details = await calculateDeliveryDetails(shop, address);
    } catch (err) {
      const known = err instanceof RoadDistanceError;
      return res.status(known ? err.status : 502).json({
        ok: false,
        error: known ? err.message : DELIVERY_MESSAGES.ROUTING_FAILED,
      });
    }

    res.json({ ok: true, data: details });
  })
);

/** GET /api/orders/my — customer order history. */
router.get(
  "/my",
  requireRole("customer", "admin"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = req.user.role === "admin" && req.query.customerId
      ? { customerId: req.query.customerId }
      : { customerId: req.user.id };
    const [items, total] = await repo("Order").findAndCount({
      where,
      relations: { items: true, shop: true },
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/orders/:id — role-scoped detail. */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const order = await repo("Order").findOne({
      where: { id: req.params.id },
      relations: { items: true, shop: true, customer: true },
    });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
    const { role, id } = req.user;
    const allowed =
      role === "admin" ||
      (role === "customer" && order.customerId === id) ||
      (role === "shopkeeper" && order.shop?.ownerId === id) ||
      (role === "delivery" && order.deliveryPartnerId === id);
    if (!allowed) return res.status(403).json({ ok: false, error: "Forbidden." });
    res.json({ ok: true, data: order });
  })
);

/** GET /api/orders/:id/track — status timeline for customer. */
router.get(
  "/:id/track",
  asyncHandler(async (req, res) => {
    const order = await repo("Order").findOne({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
    if (req.user.role === "customer" && order.customerId !== req.user.id) {
      return res.status(403).json({ ok: false, error: "Forbidden." });
    }
    const assignment = await repo("DeliveryAssignment")
      .findOne({ where: { orderId: order.id } })
      .catch(() => null);
    res.json({
      ok: true,
      data: {
        orderId: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        estimatedDelivery: order.estimatedDelivery,
        deliveredAt: order.deliveredAt,
        assignment,
      },
    });
  })
);

/** PATCH /api/orders/:id/status — shopkeeper/admin advance status. */
router.patch(
  "/:id/status",
  requireRole("shopkeeper", "admin"),
  validate({ body: z.object({ status: z.enum(ORDER_STATUSES) }) }),
  asyncHandler(async (req, res) => {
    const orders = repo("Order");
    const order = await orders.findOne({ where: { id: req.params.id }, relations: { shop: true } });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
    if (req.user.role === "shopkeeper" && order.shop?.ownerId !== req.user.id) {
      return res.status(403).json({ ok: false, error: "Not your order." });
    }
    if (!canTransition(order.status, req.body.status)) {
      return res.status(400).json({ ok: false, error: `Cannot move ${order.status} to ${req.body.status}.` });
    }
    order.status = req.body.status;
    if (req.body.status === "delivered" || req.body.status === "completed") {
      order.deliveredAt = new Date();
    }
    if (req.body.status === "cancelled") {
      order.cancelledAt = new Date();
      order.cancelReason = req.body.cancelReason || "Cancelled by shop";
    }
    const saved = await orders.save(order);
    emitToUser(order.customerId, "order:status_update", { orderId: order.id, status: order.status });
    if (order.status === "ready_for_pickup") {
      emitToRole("delivery", "delivery:request", { orderId: order.id, shopId: order.shopId });
    }
    res.json({ ok: true, data: saved });
  })
);

/** POST /api/orders/:id/cancel — customer cancel while pending. */
router.post(
  "/:id/cancel",
  requireRole("customer", "admin"),
  validate({ body: z.object({ reason: z.string().optional() }).optional() }),
  asyncHandler(async (req, res) => {
    const orders = repo("Order");
    const order = await orders.findOne({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found." });
    if (req.user.role !== "admin" && order.customerId !== req.user.id) {
      return res.status(403).json({ ok: false, error: "Forbidden." });
    }
    if (!canTransition(order.status, "cancelled")) {
      return res.status(400).json({ ok: false, error: `Cannot cancel order in ${order.status}.` });
    }
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body?.reason;
    await releaseOrderStock(order.id);
    res.json({ ok: true, data: await orders.save(order) });
  })
);

export default router;
