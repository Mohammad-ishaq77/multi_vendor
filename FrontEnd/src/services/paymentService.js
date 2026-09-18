import { APP_CONFIG } from "../config/appConfig";
import { RAZORPAY_CONFIG, isRazorpayConfigured } from "../config/razorpay";
import orderService from "./orderService";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector("script[data-razorpay]");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const apiUrl = (path) => `${RAZORPAY_CONFIG.apiBaseUrl}${path}`;

const postJson = async (path, body) => {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || "Payment request failed.");
  }
  return data;
};

const createLocalPayment = ({ amount, orderId, customer, status = "created" }) => ({
  id: `PAY-${orderId}`,
  orderId,
  amount,
  currency: RAZORPAY_CONFIG.currency,
  status,
  method: "razorpay",
  customerName: customer?.fullName,
  email: customer?.email,
  phone: customer?.phone,
  createdAt: new Date().toISOString(),
  gateway: "razorpay",
});

export const paymentService = {
  isConfigured: isRazorpayConfigured,
  methods: RAZORPAY_CONFIG.methods,

  getHistory() {
    return orderService.getPayments();
  },

  async createOrder({ amount, orderId, customer, notes = {} }) {
    const payload = {
      amount,
      currency: RAZORPAY_CONFIG.currency,
      receipt: orderId,
      notes: {
        marketplace_order_id: orderId,
        customer_name: customer?.fullName || "",
        ...notes,
      },
    };

    try {
      const data = await postJson("/payments/create-order", payload);
      return {
        ok: true,
        backend: true,
        keyId: data.keyId || RAZORPAY_CONFIG.keyId,
        razorpayOrder: data.order,
      };
    } catch (error) {
      if (!isRazorpayConfigured()) {
        return { ok: false, error: error.message || "Razorpay is not configured." };
      }
      return {
        ok: true,
        backend: false,
        keyId: RAZORPAY_CONFIG.keyId,
        razorpayOrder: null,
        warning: "Payment API is offline. Checkout will use the public key until the server is running.",
      };
    }
  },

  async verifyPayment(response) {
    try {
      const data = await postJson("/payments/verify", response);
      return { ok: true, verified: Boolean(data.verified), payment: data.payment, backend: true };
    } catch {
      return {
        ok: Boolean(response?.razorpay_payment_id),
        verified: false,
        backend: false,
        payment: {
          id: response?.razorpay_payment_id,
          status: "captured",
          method: "razorpay",
        },
      };
    }
  },

  async checkout({ amount, orderId, customer, description }) {
    const created = await this.createOrder({ amount, orderId, customer });
    if (!created.ok) {
      throw new Error(created.error || "Unable to start payment.");
    }

    const scriptReady = await loadRazorpayScript();
    if (!scriptReady || !window.Razorpay) {
      throw new Error("Unable to load Razorpay checkout. Check your network and try again.");
    }

    const paymentRecord = createLocalPayment({ amount, orderId, customer, status: "pending" });
    orderService.savePayment(paymentRecord);

    return new Promise((resolve, reject) => {
      const options = {
        key: created.keyId,
        amount: Math.round(Number(amount) * 100),
        currency: RAZORPAY_CONFIG.currency,
        name: RAZORPAY_CONFIG.companyName,
        description: description || `${APP_CONFIG.name} order ${orderId}`,
        image: APP_CONFIG.logo,
        order_id: created.razorpayOrder?.id,
        prefill: {
          name: customer?.fullName || "",
          email: customer?.email || "",
          contact: customer?.phone || "",
        },
        notes: {
          marketplace_order_id: orderId,
        },
        theme: { color: RAZORPAY_CONFIG.themeColor },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
          paylater: true,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI",
                instruments: [{ method: "upi" }],
              },
              cards: {
                name: "Credit / Debit Cards",
                instruments: [{ method: "card" }],
              },
              netbanking: {
                name: "Net Banking",
                instruments: [{ method: "netbanking" }],
              },
              wallets: {
                name: "Wallets",
                instruments: [{ method: "wallet" }],
              },
            },
            sequence: ["block.upi", "block.cards", "block.netbanking", "block.wallets"],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response) => {
          try {
            const verification = await this.verifyPayment(response);
            const nextPayment = orderService.updatePayment(paymentRecord.id, {
              status: verification.verified || verification.ok ? "paid" : "pending_verification",
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              method: verification.payment?.method || "razorpay",
              verified: Boolean(verification.verified),
              gatewayPayload: verification.payment || null,
              paidAt: new Date().toISOString(),
            });
            resolve({
              ok: true,
              payment: nextPayment,
              razorpay: response,
              verified: Boolean(verification.verified),
              backend: Boolean(created.backend && verification.backend),
            });
          } catch (error) {
            orderService.updatePayment(paymentRecord.id, { status: "failed", error: error.message });
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            orderService.updatePayment(paymentRecord.id, { status: "cancelled" });
            reject(Object.assign(new Error("Payment was cancelled."), { cancelled: true }));
          },
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (event) => {
        orderService.updatePayment(paymentRecord.id, {
          status: "failed",
          error: event?.error?.description || "Payment failed.",
        });
        reject(Object.assign(new Error(event?.error?.description || "Payment failed."), { failed: true, event }));
      });
      checkout.open();
    });
  },
};

export default paymentService;
