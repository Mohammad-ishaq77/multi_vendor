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
      amount: z.coerce.number().positive(),
      currency: z.string().default("INR"),
      receipt: z.string().optional(),
      orderId: z.string().uuid().optional(),
      notes: z.record(z.string()).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const client = getRazorpayClient();
    if (!client) {
      return res.status(503).json({ ok: false, error: "Razorpay credentials are not configured on the server." });
    }
    const { amount, currency = "INR", receipt, notes = {}, orderId } = req.body;
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
              userId: req.user.id,
              razorpayOrderId: order.id,
              amount,
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
    let payment = null;
    if (client) {
      try {
        payment = await client.payments.fetch(razorpay_payment_id);
      } catch {
        payment = null;
      }
    }
    if (isDbReady()) {
      try {
        const payments = repo("Payment");
        const record = await payments.findOne({ where: { razorpayOrderId: razorpay_order_id } });
        if (record) {
          record.razorpayPaymentId = razorpay_payment_id;
          record.razorpaySignature = razorpay_signature;
          record.status = "captured";
          record.method = payment?.method;
          record.email = payment?.email || record.email;
          record.contact = payment?.contact || record.contact;
          record.capturedAt = new Date();
          await payments.save(record);
          if (record.orderId) {
            await repo("Order").update(
              { id: record.orderId },
              { paymentStatus: "paid" }
            );
          }
        }
      } catch { /* best-effort */ }
    }
    return res.json({
      ok: true,
      verified: true,
      payment: payment
        ? {
            id: payment.id, status: payment.status, method: payment.method,
            amount: payment.amount, currency: payment.currency, email: payment.email,
            contact: payment.contact, vpa: payment.vpa, wallet: payment.wallet,
            bank: payment.bank, captured: payment.captured,
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
