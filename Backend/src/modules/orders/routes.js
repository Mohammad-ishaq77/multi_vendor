import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { calculateDeliveryDetails } from "../../common/utils/deliveryPricing.js";
import { DELIVERY_MESSAGES, RoadDistanceError } from "../../common/utils/roadDistance.js";
import { AppDataSource, isDbReady, repo } from "../../config/db.js";
import { ORDER_STATUSES } from "../../entities/Order.js";
import { canShopkeeperTransition, canTransition } from "./status.js";
import { releaseOrderStock } from "./stock.js";
import { emitToRole, emitToUser } from "../../realtime/socket.js";
import { cancellationRequestSchema } from "./cancellation.js";

const router = Router();
router.use(requireAuth);

const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.coerce.number().int().min(1) })).min(1),
  shopId: z.string().uuid().optional(),
  paymentMethod: z.string().max(50).optional(),
  notes: z.string().optional(),
  offerCode: z.string().max(30).optional(),
  checkoutId: z.string().uuid().optional(),
});

/** POST /api/orders — checkout + place one order per shop represented in cart. */
router.post(
  "/",
  requireRole("customer", "admin"),
  validate({ body: createOrderSchema }),
  asyncHandler(async (req, res) => {
    const productsRepo = repo("Product");
    const shopsRepo = repo("Shop");
    const offersRepo = repo("Offer");

    const address = await repo("Address").findOne({ where: { id: req.body.addressId } });
    if (!address || (req.user.role !== "admin" && address.userId !== req.user.id)) {
      return res.status(400).json({ ok: false, error: "Select a saved delivery address." });
    }

    const checkoutId = req.body.checkoutId || crypto.randomUUID();

    // Idempotency: a retried checkout with the same checkoutId returns the
    // orders already created instead of duplicating them.
    const existingOrders = await repo("Order").find({
      where: { customerId: req.user.id, checkoutId },
      relations: { items: true, shop: true },
    });
    if (existingOrders.length) {
      return res.status(200).json({ ok: true, data: existingOrders, checkoutId });
    }

    // Validate every cart line and group by its actual shop.
    const groups = new Map();
    for (const line of req.body.items) {
      const product = await productsRepo.findOne({
        where: { id: line.productId },
        relations: { shop: true },
      });
      if (!product || !product.isAvailable) {
        return res.status(400).json({ ok: false, error: `Product ${line.productId} unavailable.` });
      }
      const shop = product.shop;
      if (!shop || !shop.isApproved) {
        return res.status(400).json({ ok: false, error: "Shop unavailable." });
      }
      if (product.stock < line.quantity) {
        return res.status(400).json({ ok: false, error: `Insufficient stock for ${product.name}.` });
      }
      if (!groups.has(shop.id)) {
        groups.set(shop.id, { shop, lines: [], subtotal: 0 });
      }
      const group = groups.get(shop.id);
      const price = Number(product.price);
      group.subtotal += price * line.quantity;
      group.lines.push({ product, quantity: line.quantity, price });
    }

    const paymentMethod = req.body.paymentMethod || "razorpay";

    // Validate minimums, discounts and delivery pricing before touching stock.
    const prepared = [];
    for (const [shopId, group] of groups) {
      const { shop, lines, subtotal } = group;
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

      let discount = 0;
      if (req.body.offerCode) {
        const offer = await offersRepo.findOne({
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
      const totalAmount = Math.max(0, subtotal - discount + pricing.deliveryFee);

      prepared.push({ shop, lines, subtotal, discount, pricing, totalAmount });
    }

    // Transaction: create every shop order + items + stock decrement, then clear cart.
    let createdOrders = [];
    try {
      await AppDataSource.transaction(async (manager) => {
        const orderRepo = manager.getRepository("Order");
        const itemRepo = manager.getRepository("OrderItem");
        const productRepo = manager.getRepository("Product");
        const cartRepo = manager.getRepository("CartItem");

        for (const p of prepared) {
          const order = await orderRepo.save(
            orderRepo.create({
              customerId: req.user.id,
              shopId: p.shop.id,
              checkoutId,
              addressId: req.body.addressId,
              status: "pending",
              paymentStatus: "pending",
              paymentMethod,
              subtotal: p.subtotal,
              deliveryFee: p.pricing.deliveryFee,
              deliveryDistance: p.pricing.distanceKm,
              nearMartShare: p.pricing.nearMartShare,
              deliveryPartnerShare: p.pricing.deliveryPartnerShare,
              shopLat: p.shop.lat,
              shopLng: p.shop.lng,
              customerLat: address.lat,
              customerLng: address.lng,
              discount: p.discount,
              totalAmount: p.totalAmount,
              notes: req.body.notes,
            })
          );

          for (const line of p.lines) {
            await itemRepo.save(
              itemRepo.create({
                orderId: order.id,
                productId: line.product.id,
                name: line.product.name,
                price: line.price,
                quantity: line.quantity,
                imageUrl: line.product.imageUrl,
                subtotal: line.price * line.quantity,
              })
            );
            const fresh = await productRepo.findOne({ where: { id: line.product.id } });
            if (!fresh || fresh.stock < line.quantity) {
              throw Object.assign(new Error(`Insufficient stock for ${line.product.name}.`), { status: 400 });
            }
            fresh.stock -= line.quantity;
            await productRepo.save(fresh);
          }
          createdOrders.push(order.id);
        }

        // Clear ordered products from cart.
        try {
          const ids = req.body.items.map((i) => i.productId);
          await cartRepo
            .createQueryBuilder()
            .delete()
            .where("user_id = :uid", { uid: req.user.id })
            .andWhere("product_id IN (:...ids)", { ids })
            .execute();
        } catch {
          // non-fatal
        }
      });
    } catch (err) {
      const status = err?.status || 500;
      return res.status(status).json({ ok: false, error: err?.message || "Checkout failed." });
    }

    const fullOrders = await repo("Order").find({
      where: { customerId: req.user.id, checkoutId },
      relations: { items: true, shop: true },
      order: { createdAt: "ASC" },
    });

    for (const order of fullOrders) {
      emitToRole("shopkeeper", "order:new", { orderId: order.id, shopId: order.shopId });
    }
    res.status(201).json({ ok: true, data: fullOrders, checkoutId });
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
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        cancelReason: order.cancelReason,
        cancelDetails: order.cancelDetails,
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
    const allowed = req.user.role === "admin"
      ? canTransition(order.status, req.body.status)
      : canShopkeeperTransition(order.status, req.body.status);
    if (!allowed) {
      return res.status(400).json({ ok: false, error: `Cannot move ${order.status} to ${req.body.status}.` });
    }
    if (req.user.role === "admin" && ["delivered", "completed"].includes(req.body.status)) {
      const result = await AppDataSource.transaction(async (manager) => {
        const transactionalOrders = manager.getRepository("Order");
        const currentOrder = await transactionalOrders.findOne({
          where: { id: req.params.id },
          lock: { mode: "pessimistic_write" },
        });
        if (!currentOrder) return { status: 404, error: "Order not found." };
        if (!canTransition(currentOrder.status, req.body.status)) {
          return {
            status: 400,
            error: `Cannot move ${currentOrder.status} to ${req.body.status}.`,
          };
        }

        const assignments = manager.getRepository("DeliveryAssignment");
        const assignment = await assignments.findOne({
          where: { orderId: currentOrder.id },
          lock: { mode: "pessimistic_write" },
        });
        let partner = null;
        if (assignment?.partnerId) {
          partner = await manager.getRepository("DeliveryPartner").findOne({
            where: { id: assignment.partnerId },
            lock: { mode: "pessimistic_write" },
          });
          if (!partner) {
            return { status: 409, error: "The assigned delivery partner could not be found." };
          }
        }

        const completedAt = currentOrder.deliveredAt || new Date();
        currentOrder.status = req.body.status;
        currentOrder.deliveredAt = completedAt;
        await transactionalOrders.save(currentOrder);

        if (assignment) {
          if (partner && assignment.status !== "delivered" && !assignment.deliveredAt) {
            const earning = Number(assignment.partnerEarning || 0);
            partner.completedDeliveries += 1;
            partner.totalDeliveries += 1;
            partner.todayDeliveries += 1;
            partner.totalEarnings = Number(partner.totalEarnings) + earning;
            partner.todayEarnings = Number(partner.todayEarnings) + earning;
            await manager.getRepository("DeliveryPartner").save(partner);
          }
          assignment.status = "delivered";
          assignment.deliveredAt = assignment.deliveredAt || completedAt;
          await assignments.save(assignment);
        }

        return { order: currentOrder, partnerUserId: partner?.userId };
      });

      if (result.status) {
        return res.status(result.status).json({ ok: false, error: result.error });
      }

      const update = {
        orderId: result.order.id,
        shopId: result.order.shopId,
        status: result.order.status,
        adminCompleted: true,
      };
      emitToUser(result.order.customerId, "order:status_update", update);
      emitToRole("shopkeeper", "order:status_update", update);
      if (result.partnerUserId) emitToUser(result.partnerUserId, "delivery:status_update", update);

      const saved = await orders.findOne({
        where: { id: result.order.id },
        relations: { shop: true },
      });
      return res.json({ ok: true, data: saved });
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
    if (order.status === "preparing" || order.status === "ready_for_pickup") {
      emitToRole("delivery", "delivery:request", { orderId: order.id, shopId: order.shopId });
    }
    res.json({ ok: true, data: saved });
  })
);

/** POST /api/orders/:id/cancel — customer cancel while pending. */
router.post(
  "/:id/cancel",
  requireRole("customer", "admin"),
  validate({ body: cancellationRequestSchema }),
  asyncHandler(async (req, res) => {
    if (!isDbReady()) {
      return res.status(503).json({ ok: false, error: "Database unavailable." });
    }

    const result = await AppDataSource.transaction(async (manager) => {
      const orders = manager.getRepository("Order");
      const order = await orders.findOne({
        where: { id: req.params.id },
        lock: { mode: "pessimistic_write" },
      });
      if (!order) return { status: 404, error: "Order not found." };
      if (req.user.role !== "admin" && order.customerId !== req.user.id) {
        return { status: 403, error: "Forbidden." };
      }
      if (!canTransition(order.status, "cancelled")) {
        return { status: 400, error: `Cannot cancel order in ${order.status}.` };
      }

      order.status = "cancelled";
      order.cancelledAt = new Date();
      order.cancelReason = req.body.reason;
      order.cancelDetails = req.body.details || null;
      const savedOrder = await orders.save(order);
      await releaseOrderStock(order.id, manager);
      return { order: savedOrder };
    });

    if (result.status) {
      return res.status(result.status).json({ ok: false, error: result.error });
    }
    emitToUser(result.order.customerId, "order:status_update", {
      orderId: result.order.id,
      status: result.order.status,
    });
    return res.json({ ok: true, data: result.order });
  })
);

export default router;
