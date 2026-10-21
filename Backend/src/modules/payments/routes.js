import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { config } from "../../config/env.js";
import { getRazorpayClient, isRazorpayConfigured, toPaise } from "../../config/razorpay.js";
import { isDbReady, repo } from "../../config/db.js";
import { verifyRazorpaySignature } from "../auth/service.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";

const router = Router();

/** GET /api/payments/config — public (same contract as legacy server). */
router.get("/config", (_req, res) => {
  res.json({
    ok: true,
    configured: isRazorpayConfigured(),
    keyId: config.razorpay.keyId,
    currency: "INR",
    methods: ["upi", "card", "netbanking", "wallet", "emi", "paylater"],
  });
});

/** POST /api/payments/create-order — create Razorpay order + persist. */
router.post(
  "/create-order",
  requireAuth,
  validate({
    body: z.object({
      amount: z.coerce.number().positive().optional(),
      currency: z.string().default("INR"),
      receipt: z.string().optional(),
      orderId: z.string().uuid().optional(),
      checkoutId: z.string().uuid().optional(),
      notes: z.record(z.string()).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const client = getRazorpayClient();
    if (!client) {
      return res.status(503).json({ ok: false, error: "Razorpay credentials are not configured on the server." });
    }
    const { currency = "INR", receipt, notes = {}, orderId, checkoutId } = req.body;

    // Idempotency: return an existing, still-created Razorpay order instead of
    // creating a second one for the same checkout.
    if (isDbReady()) {
      try {
        const payments = repo("Payment");
        const existing = await payments.findOne({
          where: checkoutId ? { checkoutId, userId: req.user.id } : { orderId: orderId || null, userId: req.user.id },
        });
        if (existing && existing.razorpayOrderId && existing.status !== "captured" && existing.status !== "failed") {
          return res.json({
            ok: true,
            order: { id: existing.razorpayOrderId, amount: toPaise(existing.amount), currency: existing.currency, receipt: receipt || existing.razorpayOrderId, status: "created" },
            keyId: config.razorpay.keyId,
          });
        }
      } catch { /* best-effort */ }
    }

    // Trust server-side order data for the payable amount.
    let amount = req.body.amount;
    if (checkoutId && isDbReady()) {
      try {
        const owned = await repo("Order").find({ where: { checkoutId, customerId: req.user.id } });
        if (owned.length) amount = owned.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      } catch { /* fall back to supplied amount */ }
    } else if (orderId && isDbReady()) {
      try {
        const owned = await repo("Order").findOne({ where: { id: orderId, customerId: req.user.id } });
        if (owned) amount = Number(owned.totalAmount || amount);
      } catch { /* fall back */ }
    }
    const paise = toPaise(amount);
    if (!Number.isFinite(paise) || paise < 100) {
      return res.status(400).json({ ok: false, error: "A valid amount of at least ₹1 is required." });
    }
    try {
      const order = await client.orders.create({
        amount: paise,
        currency,
        receipt: receipt || `nm_${Date.now()}`,
        notes,
      });
      if (isDbReady()) {
        try {
          const payments = repo("Payment");
          await payments.save(
            payments.create({
              orderId: orderId || null,
              checkoutId: checkoutId || null,
              userId: req.user.id,
              razorpayOrderId: order.id,
              amount: Number(amount),
              currency: order.currency,
              status: "created",
              email: notes.customer_email,
              contact: notes.customer_contact,
            })
          );
        } catch { /* persist best-effort */ }
      }
      return res.json({
        ok: true,
        order: { id: order.id, amount: order.amount, currency: order.currency, receipt: order.receipt, status: order.status },
        keyId: config.razorpay.keyId,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: error?.error?.description || error.message || "Unable to create Razorpay order.",
      });
    }
  })
);

/** POST /api/payments/verify — verify signature + mark captured. */
router.post(
  "/verify",
  requireAuth,
  validate({
    body: z.object({
      razorpay_order_id: z.string().min(1),
      razorpay_payment_id: z.string().min(1),
      razorpay_signature: z.string().min(1),
    }),
  }),
  asyncHandler(async (req, res) => {
    if (!config.razorpay.keySecret) {
      return res.status(503).json({ ok: false, error: "Razorpay secret is not configured." });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const valid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      config.razorpay.keySecret
    );
    if (!valid) {
      return res.status(400).json({ ok: false, verified: false, error: "Payment signature mismatch." });
    }
    const client = getRazorpayClient();
    let paymentGateway = null;
    if (client) {
      try {
        paymentGateway = await client.payments.fetch(razorpay_payment_id);
      } catch {
        paymentGateway = null;
      }
    }
    if (isDbReady()) {
      try {
        const payments = repo("Payment");
        const record = await payments.findOne({ where: { razorpayOrderId: razorpay_order_id } });
        if (record) {
          if (record.userId && record.userId !== req.user.id) {
            return res.status(403).json({ ok: false, verified: false, error: "Forbidden." });
          }
          // Already captured: do not reprocess or double update.
          if (record.status === "captured") {
            return res.json({ ok: true, verified: true, payment: paymentGateway ? { id: paymentGateway.id, status: paymentGateway.status } : { id: razorpay_payment_id, status: "captured" } });
          }
          record.razorpayPaymentId = razorpay_payment_id;
          record.razorpaySignature = razorpay_signature;
          record.status = "captured";
          record.method = paymentGateway?.method || record.method;
          record.email = paymentGateway?.email || record.email;
          record.contact = paymentGateway?.contact || record.contact;
          record.capturedAt = new Date();
          await payments.save(record);

          // Mark every shop order under this checkout as paid.
          if (record.checkoutId) {
            await repo("Order").update({ checkoutId: record.checkoutId }, { paymentStatus: "paid" });
          } else if (record.orderId) {
            await repo("Order").update({ id: record.orderId }, { paymentStatus: "paid" });
          }
        }
      } catch { /* best-effort */ }
    }
    return res.json({
      ok: true,
      verified: true,
      payment: paymentGateway
        ? {
            id: paymentGateway.id, status: paymentGateway.status, method: paymentGateway.method,
            amount: paymentGateway.amount, currency: paymentGateway.currency, email: paymentGateway.email,
            contact: paymentGateway.contact, vpa: paymentGateway.vpa, wallet: paymentGateway.wallet,
            bank: paymentGateway.bank, captured: paymentGateway.captured,
          }
        : { id: razorpay_payment_id, status: "captured" },
    });
  })
);

/**
 * POST /api/payments/webhook — Razorpay async events (payment.captured / payment.failed / refund).
 * Raw body is preserved in index.js for signature validation.
 */
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const secret = config.razorpay.webhookSecret;
    if (!secret) return res.status(503).json({ ok: false, error: "Webhook secret not configured." });
    const signature = req.headers["x-razorpay-signature"];
    const raw = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (expected !== signature) {
      return res.status(400).json({ ok: false, error: "Invalid webhook signature." });
    }
    const { event, payload } = req.body || {};
    if (isDbReady() && payload?.payment?.entity) {
      try {
        const entity = payload.payment.entity;
        const payments = repo("Payment");
        const record = await payments.findOne({ where: { razorpayOrderId: entity.order_id } });
        if (record) {
          if (event === "payment.captured") {
            record.status = "captured";
            record.razorpayPaymentId = entity.id;
            record.method = entity.method;
            record.capturedAt = new Date();
            await payments.save(record);
            if (record.orderId) await repo("Order").update({ id: record.orderId }, { paymentStatus: "paid" });
          } else if (event === "payment.failed") {
            record.status = "failed";
            await payments.save(record);
            if (record.orderId) await repo("Order").update({ id: record.orderId }, { paymentStatus: "failed" });
          }
        }
      } catch { /* best-effort */ }
    }
    res.json({ ok: true });
  })
);

/** GET /api/payments/my — customer payment history. */
router.get(
  "/my",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const [items, total] = await repo("Payment").findAndCount({
      where: { userId: req.user.id },
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/payments — admin platform-wide view. */
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const [items, total] = await repo("Payment").findAndCount({
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** GET /api/payments/:paymentId — fetch from Razorpay by ID (authorized). */
router.get(
  "/:paymentId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const client = getRazorpayClient();
    if (!client) return res.status(503).json({ ok: false, error: "Razorpay is not configured." });
    try {
      const payment = await client.payments.fetch(req.params.paymentId);
      return res.json({ ok: true, payment });
    } catch {
      return res.status(404).json({ ok: false, error: "Payment not found." });
    }
  })
);

export default router;
