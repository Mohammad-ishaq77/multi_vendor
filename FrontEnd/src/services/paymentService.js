import { RAZORPAY_PUBLIC_KEY } from "../config/env";
import { paymentApi } from "./orderService";
import { ApiError } from "./apiClient";
import { APP_CONFIG } from "../config/appConfig";

/**
 * Razorpay checkout orchestration.
 *
 * Responsibilities, in order:
 *   1. ask the backend to create the Razorpay order
 *   2. open the Razorpay window with the PUBLIC key only
 *   3. hand the gateway response back to the backend for verification
 *   4. resolve only when the backend reports `verified: true`
 *
 * There is deliberately no offline/demo branch: if the server has no Razorpay
 * credentials, checkout fails loudly instead of pretending to be paid.
 */

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const PAYMENT_BLOCKS = {
  currency: "INR",
  name: APP_CONFIG.name,
  image: APP_CONFIG.logo,
  theme: { color: "#047857" },
};

const notConfigured = () =>
  new ApiError(
    "Payments are not available right now. The server has not been configured with Razorpay credentials.",
    { status: 503 }
  );

/** Load checkout.js once per page session. */
export const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new ApiError("Payments are only available in a browser.", { status: 400 }));
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector("script[data-razorpay]");
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => reject(new ApiError("Could not load Razorpay checkout.", { status: 503 })), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new ApiError("Could not load Razorpay checkout. Check your connection.", { status: 503 }));
    document.head.appendChild(script);
  });

export const razorpayCheckout = {
  /** True when the browser has a public key to work with. */
  hasPublicKey: () => Boolean(RAZORPAY_PUBLIC_KEY),

  /**
   * Full server-verified payment round-trip.
   *
   * @param {object} args
   * @param {number} args.amount      Total in rupees (from the backend order)
   * @param {string} args.orderId     NearMart order UUID (stored by the backend)
   * @param {object} [args.customer]  { fullName, email, phone } for prefill
   * @param {string} [args.description]
   * @returns {Promise<{ok:true, verified:true, payment:object, razorpay:object}>}
   * @throws  {ApiError} whenever the payment is not server-verified
   */
  async checkout({ amount, orderId, customer, description }) {
    if (!RAZORPAY_PUBLIC_KEY) throw notConfigured();

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      throw new ApiError("A valid order total is required to start payment.", { status: 400 });
    }

    // 1. Backend creates the Razorpay order and stores the record.
    const created = await paymentApi.createOrder({
      amount: value,
      orderId,
      notes: {
        marketplace_order_id: orderId,
        ...(customer?.fullName ? { customer_name: customer.fullName } : {}),
        ...(customer?.email ? { customer_email: customer.email } : {}),
        ...(customer?.phone ? { customer_contact: customer.phone } : {}),
      },
    });

    const gatewayOrder = created.order;
    const keyId = created.keyId || RAZORPAY_PUBLIC_KEY;
    if (!gatewayOrder?.id) {
      throw new ApiError("The server did not return a payment order.", { status: 502 });
    }

    await loadRazorpayScript();

    const gatewayResponse = await new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: keyId,
        amount: Number(gatewayOrder.amount ?? Math.round(value * 100)),
        currency: gatewayOrder.currency || PAYMENT_BLOCKS.currency,
        order_id: gatewayOrder.id,
        name: description ? APP_CONFIG.name : PAYMENT_BLOCKS.name,
        description: description || `Order ${orderId}`,
        image: PAYMENT_BLOCKS.image,
        prefill: {
          name: customer?.fullName || "",
          email: customer?.email || "",
          contact: customer?.phone || "",
        },
        notes: { marketplace_order_id: orderId },
        theme: PAYMENT_BLOCKS.theme,
        method: { upi: true, card: true, netbanking: true, wallet: true, emi: true, paylater: true },
        config: {
          display: {
            blocks: {
              upi: { name: "Pay using UPI", instruments: [{ method: "upi" }] },
              cards: { name: "Credit / Debit Cards", instruments: [{ method: "card" }] },
              netbanking: { name: "Net Banking", instruments: [{ method: "netbanking" }] },
              wallets: { name: "Wallets", instruments: [{ method: "wallet" }] },
            },
            sequence: ["block.upi", "block.cards", "block.netbanking", "block.wallets"],
            preferences: { show_default_blocks: true },
          },
        },
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () =>
            reject(Object.assign(new ApiError("Payment was cancelled.", { status: 400 }), { cancelled: true })),
        },
      });

      checkout.on("payment.failed", (event) => {
        const description =
          event?.error?.description || "The payment could not be completed.";
        reject(Object.assign(new ApiError(description, { status: 402 }), { failed: true }));
      });

      checkout.open();
    });

    // 2. The server checks the HMAC signature with RAZORPAY_KEY_SECRET.
    const verification = await paymentApi.verify(gatewayResponse);

    if (!verification?.verified) {
      throw new ApiError(
        "Payment verification failed. If you were charged, contact support with your order id.",
        { status: 400 }
      );
    }

    return {
      ok: true,
      verified: true,
      payment: verification.payment,
      razorpay: gatewayResponse,
    };
  },
};

/** Kept as the default export name used across checkout screens. */
export const paymentService = razorpayCheckout;
export default razorpayCheckout;