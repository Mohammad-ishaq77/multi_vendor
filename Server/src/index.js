import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import Razorpay from "razorpay";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(express.json({ limit: "1mb" }));

const getClient = () => {
  if (!KEY_ID || !KEY_SECRET) return null;
  return new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
};

const toPaise = (amount) => Math.round(Number(amount) * 100);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "nearmart-payments" });
});

app.get("/api/payments/config", (_req, res) => {
  res.json({
    ok: true,
    configured: Boolean(KEY_ID && KEY_SECRET),
    keyId: KEY_ID,
    currency: "INR",
    methods: ["upi", "card", "netbanking", "wallet", "emi", "paylater"],
  });
});

app.post("/api/payments/create-order", async (req, res) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(503).json({
        ok: false,
        error: "Razorpay credentials are not configured on the server.",
      });
    }

    const { amount, currency = "INR", receipt, notes = {} } = req.body || {};
    const paise = toPaise(amount);

    if (!Number.isFinite(paise) || paise < 100) {
      return res.status(400).json({ ok: false, error: "A valid amount of at least ₹1 is required." });
    }

    const order = await client.orders.create({
      amount: paise,
      currency,
      receipt: receipt || `nm_${Date.now()}`,
      notes,
    });

    return res.json({
      ok: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      },
      keyId: KEY_ID,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.error?.description || error.message || "Unable to create Razorpay order.",
    });
  }
});

app.post("/api/payments/verify", async (req, res) => {
  try {
    if (!KEY_SECRET) {
      return res.status(503).json({ ok: false, error: "Razorpay secret is not configured." });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Missing Razorpay verification fields." });
    }

    const expected = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const valid = expected === razorpay_signature;
    if (!valid) {
      return res.status(400).json({ ok: false, verified: false, error: "Payment signature mismatch." });
    }

    const client = getClient();
    let payment = null;
    if (client) {
      try {
        payment = await client.payments.fetch(razorpay_payment_id);
      } catch {
        payment = null;
      }
    }

    return res.json({
      ok: true,
      verified: true,
      payment: payment
        ? {
            id: payment.id,
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency,
            email: payment.email,
            contact: payment.contact,
            vpa: payment.vpa,
            wallet: payment.wallet,
            bank: payment.bank,
            captured: payment.captured,
          }
        : { id: razorpay_payment_id, status: "captured" },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Unable to verify payment.",
    });
  }
});

app.get("/api/payments/:paymentId", async (req, res) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(503).json({ ok: false, error: "Razorpay is not configured." });
    }
    const payment = await client.payments.fetch(req.params.paymentId);
    return res.json({ ok: true, payment });
  } catch (error) {
    return res.status(404).json({ ok: false, error: "Payment not found." });
  }
});

app.listen(PORT, () => {
  console.log(`NearMart payment API running on http://localhost:${PORT}`);
});
