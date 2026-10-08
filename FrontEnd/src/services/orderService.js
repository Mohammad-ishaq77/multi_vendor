import apiClient, { ApiError } from "./apiClient";
import { toPage as paged } from "../utils/pagination";

/**
 * Orders and payments.
 *
 * Money is never trusted from the client: `POST /api/orders` recomputes price,
 * stock, discount, delivery fee and the final total on the server, and that
 * response is what the UI renders.
 */

export const orderService = {
  /**
   * POST /api/orders
   * @param {{shopId:string, addressId?:string, items:{productId:string,quantity:number}[],
   *          paymentMethod?:string, notes?:string, offerCode?:string}} payload
   * @returns the persisted order, including server-computed totals
   */
  async create(payload) {
    if (!payload?.shopId) {
      throw new ApiError("A shop is required to place an order.", { status: 400 });
    }
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new ApiError("Your cart is empty.", { status: 400 });
    }
    return apiClient.post("/orders", payload);
  },

  /** GET /api/orders/my */
  async myOrders(params = {}) {
    return paged(await apiClient.get("/orders/my", { query: params }));
  },

  /**
   * GET /api/orders/delivery-quote?shopId=&addressId= — server-priced delivery
   * preview (real road distance, fee, availability). The client never sends a
   * distance or a fee; the server recomputes both from shop + address
   * coordinates, so the checkout preview always matches what the order charges.
   * @returns {Promise<{distanceKm:number, deliveryFee:number, nearMartShare:number,
   *          deliveryPartnerShare:number, deliveryAvailable:boolean, message?:string}>}
   */
  async deliveryQuote(shopId, addressId) {
    if (!shopId || !addressId) return null;
    return apiClient.get("/orders/delivery-quote", { query: { shopId, addressId } });
  },

  /** GET /api/orders/:id */
  async get(id) {
    return apiClient.get(`/orders/${encodeURIComponent(id)}`);
  },

  /** GET /api/orders/:id/track */
  async track(id) {
    return apiClient.get(`/orders/${encodeURIComponent(id)}/track`);
  },

  /** POST /api/orders/:id/cancel */
  async cancel(id, reason) {
    return apiClient.post(`/orders/${encodeURIComponent(id)}/cancel`, reason ? { reason } : {});
  },

  /** PATCH /api/orders/:id/status — shopkeeper/admin flow. */
  async updateStatus(id, status, extra = {}) {
    return apiClient.patch(`/orders/${encodeURIComponent(id)}/status`, { status, ...extra });
  },
};

export const paymentApi = {
  /**
   * GET /api/payments/config — public; tells the UI whether the server has
   * Razorpay credentials at all.
   */
  async config() {
    try {
      const payload = await apiClient.request("GET", "/payments/config", {
        auth: false,
        unwrap: false,
      });
      return payload;
    } catch {
      return { ok: false, configured: false, keyId: "", currency: "INR", methods: [] };
    }
  },

  /** POST /api/payments/create-order */
  async createOrder({ amount, orderId, notes = {} }) {
    return apiClient.post("/payments/create-order", {
      amount,
      currency: "INR",
      receipt: orderId,
      orderId,
      notes,
    });
  },

  /**
   * POST /api/payments/verify — the ONLY place a Razorpay signature is checked.
   * The secret never reaches the browser.
   */
  async verify(response) {
    return apiClient.post("/payments/verify", {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    });
  },

  /** GET /api/payments/my */
  async myPayments(params = {}) {
    return paged(await apiClient.get("/payments/my", { query: params }));
  },
};

/**
 * Shopkeeper-scoped APIs (all require the shopkeeper role server-side).
 */
export const shopkeeperService = {
  /** GET /api/shopkeeper/stats */
  stats: () => apiClient.get("/shopkeeper/stats"),

  /** GET /api/shopkeeper/status */
  status: () => apiClient.get("/shopkeeper/status"),

  /** PUT /api/shopkeeper/onboarding/step */
  saveOnboardingStep: (step, data) => apiClient.put("/shopkeeper/onboarding/step", { step, data }),

  /** POST /api/shopkeeper/documents */
  addDocument: (payload) => apiClient.post("/shopkeeper/documents", payload),

  /** GET /api/shopkeeper/documents */
  documents: async () => (await apiClient.get("/shopkeeper/documents")) || [],

  /** POST /api/shopkeeper/approval/resubmit */
  resubmitApproval: () => apiClient.post("/shopkeeper/approval/resubmit"),

  /** GET /api/shopkeeper/products */
  products: (params = {}) => apiClient.get("/shopkeeper/products", { query: params }).then(paged),

  /** GET /api/shopkeeper/products/:id */
  product: (id) => apiClient.get(`/shopkeeper/products/${encodeURIComponent(id)}`),

  /** GET /api/shopkeeper/orders */
  orders: (params = {}) => apiClient.get("/shopkeeper/orders", { query: params }).then(paged),

  /** GET /api/shopkeeper/orders/:id */
  order: (id) => apiClient.get(`/shopkeeper/orders/${encodeURIComponent(id)}`),

  /** PATCH /api/shopkeeper/orders/:id/status */
  updateOrderStatus: (id, status) =>
    apiClient.patch(`/shopkeeper/orders/${encodeURIComponent(id)}/status`, { status }),

  /** GET /api/shopkeeper/offers */
  offers: async () => (await apiClient.get("/shopkeeper/offers")) || [],

  /** POST /api/shopkeeper/offers */
  createOffer: (payload) => apiClient.post("/shopkeeper/offers", payload),

  /** GET /api/shopkeeper/earnings */
  earnings: () => apiClient.get("/shopkeeper/earnings"),

  /** GET /api/shopkeeper/reviews */
  reviews: (params = {}) => apiClient.get("/shopkeeper/reviews", { query: params }).then(paged),

  /** GET /api/shopkeeper/profile */
  profile: () => apiClient.get("/shopkeeper/profile"),

  /** PUT /api/shopkeeper/profile */
  updateProfile: (payload) => apiClient.put("/shopkeeper/profile", payload),
};

/**
 * Delivery-partner APIs (role checked server-side).
 */
export const deliveryService = {
  /** GET /api/delivery/stats */
  stats: () => apiClient.get("/delivery/stats"),

  /** POST /api/delivery/onboarding */
  saveOnboardingStep: (step, data) => apiClient.post("/delivery/onboarding", { step, data }),

  /** PATCH /api/delivery/status */
  setOnline: (isOnline) => apiClient.patch("/delivery/status", { isOnline }),

  /** GET /api/delivery/available */
  available: async (params = {}) => (await apiClient.get("/delivery/available", { query: params })) || [],

  /** GET /api/delivery/active */
  active: () => apiClient.get("/delivery/active"),

  /** GET /api/delivery/orders/:id — full pickup details. */
  order: (orderId) => apiClient.get(`/delivery/orders/${encodeURIComponent(orderId)}`),

  /** POST /api/delivery/accept/:orderId */
  accept: (orderId) => apiClient.post(`/delivery/accept/${encodeURIComponent(orderId)}`),

  /** PATCH /api/delivery/orders/:id/status */
  updateStatus: (orderId, status) =>
    apiClient.patch(`/delivery/orders/${encodeURIComponent(orderId)}/status`, { status }),

  /** GET /api/delivery/history */
  history: (params = {}) => apiClient.get("/delivery/history", { query: params }).then(paged),

  /** GET /api/delivery/earnings */
  earnings: () => apiClient.get("/delivery/earnings"),

  /** GET /api/delivery/profile */
  profile: () => apiClient.get("/delivery/profile"),

  /** PUT /api/delivery/profile */
  updateProfile: (payload) => apiClient.put("/delivery/profile", payload),

  /** POST /api/delivery/documents */
  addDocument: (payload) => apiClient.post("/delivery/documents", payload),

  /** GET /api/delivery/documents */
  documents: async () => (await apiClient.get("/delivery/documents")) || [],

  /** GET /api/delivery/notifications */
  notifications: async () => (await apiClient.get("/delivery/notifications")) || [],
};

/**
 * Admin APIs (role checked server-side).
 */
export const adminService = {
  /** GET /api/admin/stats */
  stats: () => apiClient.get("/admin/stats"),

  /** GET /api/users */
  users: (params = {}) => apiClient.get("/users", { query: params }).then(paged),

  /** PATCH /api/users/:id */
  updateUser: (id, payload) => apiClient.patch(`/users/${encodeURIComponent(id)}`, payload),

  /** GET /api/admin/shops */
  shops: (params = {}) => apiClient.get("/admin/shops", { query: params }).then(paged),

  /** GET /api/admin/shops/:id/documents — real uploaded shop documents. */
  shopDocuments: async (shopId) =>
    (await apiClient.get(`/admin/shops/${encodeURIComponent(shopId)}/documents`)) || [],

  /** GET /api/admin/orders */
  orders: (params = {}) => apiClient.get("/admin/orders", { query: params }).then(paged),

  /** GET /api/admin/orders/:id */
  order: (id) => apiClient.get(`/admin/orders/${encodeURIComponent(id)}`),

  /** PATCH /api/orders/:id/status — admin moderation of an order. */
  updateOrderStatus: (id, status) =>
    apiClient.patch(`/orders/${encodeURIComponent(id)}/status`, { status }),

  /** GET /api/admin/deliveries */
  deliveries: (params = {}) => apiClient.get("/admin/deliveries", { query: params }).then(paged),

  /** GET /api/payments (admin, platform-wide) */
  payments: (params = {}) => apiClient.get("/payments", { query: params }).then(paged),

  /** GET /api/approvals?type=&status= */
  approvals: (params = {}) => apiClient.get("/approvals", { query: params }).then(paged),

  /** GET /api/approvals/:id/documents — applicant's real uploaded documents. */
  approvalDocuments: async (id) =>
    (await apiClient.get(`/approvals/${encodeURIComponent(id)}/documents`)) || [],

  /** PATCH /api/approvals/:id — cascades to the shop/partner record. */
  reviewApproval: (id, status, notes) =>
    apiClient.patch(`/approvals/${encodeURIComponent(id)}`, { status, notes }),

  /** GET /api/reports */
  reports: () => apiClient.get("/reports"),

  /** GET /api/products (admin can read the whole catalogue) */
  products: (params = {}) => apiClient.get("/products", { query: params }).then(paged),

  /** GET /api/categories (admin) */
  categories: async () => (await apiClient.get("/categories")) || [],

  /** GET /api/offers */
  offers: async () => (await apiClient.get("/offers", { query: { } })) || [],

  /** POST /api/offers (admin) */
  createOffer: (payload) => apiClient.post("/offers", payload),

  /** PUT /api/offers/:id */
  updateOffer: (id, payload) => apiClient.put(`/offers/${encodeURIComponent(id)}`, payload),

  /** DELETE /api/offers/:id */
  deleteOffer: (id) => apiClient.delete(`/offers/${encodeURIComponent(id)}`),
};

export default {
  orderService,
  paymentApi,
  shopkeeperService,
  deliveryService,
  adminService,
};