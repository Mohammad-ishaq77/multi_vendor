import apiClient, { ApiError } from "./apiClient";
import { toPage as paged } from "../utils/pagination";

/**
 * Thin, typed wrappers over the marketplace read APIs.
 * Every page reads through these so there is a single place to change a path.
 *
 * Lists return `{ items, pagination }`; a failed request throws instead of
 * returning placeholder data.
 */

/** Call the API and never fabricate data when the request fails. */
const guard = async (loader, fallback) => {
  try {
    return await loader();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return fallback;
    throw error;
  }
};

const SHOP_PROFILE_UPDATED_EVENT = "nearmart-shop-profile-updated";
const SHOP_PROFILE_CHANNEL = "nearmart-shop-profile";
const shopProfileChannel =
  typeof window === "undefined" || typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel(SHOP_PROFILE_CHANNEL);

export const subscribeToShopProfileUpdates = (callback) => {
  if (typeof window === "undefined") return () => {};

  const notify = () => callback();
  window.addEventListener(SHOP_PROFILE_UPDATED_EVENT, notify);
  shopProfileChannel?.addEventListener("message", notify);

  return () => {
    window.removeEventListener(SHOP_PROFILE_UPDATED_EVENT, notify);
    shopProfileChannel?.removeEventListener("message", notify);
  };
};

const publishShopProfileUpdate = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(SHOP_PROFILE_UPDATED_EVENT));
  shopProfileChannel?.postMessage({ type: "updated" });
};

export const categoryService = {
  /** GET /api/categories */
  async list() {
    return (await apiClient.get("/categories")) || [];
  },

  /** GET /api/categories/:idOrSlug */
  async get(idOrSlug) {
    if (!idOrSlug) return null;
    return guard(() => apiClient.get(`/categories/${encodeURIComponent(idOrSlug)}`), null);
  },
};

export const productService = {
  /**
   * GET /api/products
   * @param {{shopId?:string, categoryId?:string, search?:string,
   *          availableOnly?:boolean|string (filter to available products when true),
   *          page?:number, limit?:number}} params
   */
  async list(params = {}) {
    return paged(await apiClient.get("/products", { query: params }));
  },

  /** GET /api/products/:id */
  async get(id) {
    return guard(() => apiClient.get(`/products/${encodeURIComponent(id)}`), null);
  },

  /** GET /api/products/:id/recommendations */
  async getRecommendations(id, limit = 6) {
    return guard(
      async () =>
        (await apiClient.get(`/products/${encodeURIComponent(id)}/recommendations`, {
          query: { limit },
        })) || [],
      []
    );
  },

  async create(payload) {
    return apiClient.post("/products", payload, { timeoutMs: 60_000 });
  },

  async update(id, payload) {
    return apiClient.put(`/products/${encodeURIComponent(id)}`, payload);
  },

  async remove(id) {
    return apiClient.delete(`/products/${encodeURIComponent(id)}`);
  },
};

export const shopService = {
  /** GET /api/shops; sort: "recent" returns newest shops first. */
  async list(params = {}) {
    return paged(await apiClient.get("/shops", { query: params }));
  },

  /** GET /api/shops/:id */
  async get(id) {
    return guard(() => apiClient.get(`/shops/${encodeURIComponent(id)}`), null);
  },

  /** GET /api/shops/:id/products */
  async productsForShop(shopId, params = {}) {
    return paged(
      await apiClient.get(`/shops/${encodeURIComponent(shopId)}/products`, { query: params })
    );
  },

  /** GET /api/shops/my — the signed-in shopkeeper's shop. */
  async mine() {
    return guard(() => apiClient.get("/shops/my"), null);
  },

  /** POST /api/shops — shopkeeper onboarding. */
  async create(payload) {
    return apiClient.post("/shops", payload);
  },

  /** PUT /api/shops/my */
  async updateMine(payload) {
    const updated = await apiClient.put("/shops/my", payload);
    publishShopProfileUpdate();
    return updated;
  },

  /** PATCH /api/shops/my/status */
  async setOpen(isOpen) {
    return apiClient.patch("/shops/my/status", { isOpen });
  },

  /** PATCH /api/shops/:id — admin moderation. */
  async moderate(id, payload) {
    return apiClient.patch(`/shops/${encodeURIComponent(id)}`, payload);
  },
};

export const offerService = {
  /** GET /api/offers?shopId= */
  async list(params = {}) {
    return (await apiClient.get("/offers", { query: params })) || [];
  },

  /** POST /api/offers — shopkeeper (own shop) or admin. */
  async create(payload) {
    return apiClient.post("/offers", payload);
  },

  /** PUT /api/offers/:id */
  async update(id, payload) {
    return apiClient.put(`/offers/${encodeURIComponent(id)}`, payload);
  },

  /** DELETE /api/offers/:id */
  async remove(id) {
    return apiClient.delete(`/offers/${encodeURIComponent(id)}`);
  },
};

export const reviewService = {
  /** GET /api/reviews?shopId=&productId= */
  async list(params = {}) {
    return paged(await apiClient.get("/reviews", { query: params }));
  },

  /** POST /api/reviews */
  async create(payload) {
    return apiClient.post("/reviews", payload);
  },
};

export const notificationService = {
  /** GET /api/notifications */
  async list(params = {}) {
    return paged(await apiClient.get("/notifications", { query: params }));
  },

  /** PATCH /api/notifications/:id/read */
  async markRead(id) {
    return apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`);
  },
};

export const customerService = {
  /** GET /api/customer/stats */
  stats() {
    return apiClient.get("/customer/stats");
  },

  /** GET /api/profile */
  profile() {
    return apiClient.get("/profile");
  },

  /** PUT /api/profile */
  updateProfile(payload) {
    return apiClient.put("/profile", payload);
  },
};

export const uploadService = {
  /**
   * POST /api/uploads — multipart. Cloudinary credentials stay on the server;
   * the browser only ever sends the file bytes.
   * @returns {Promise<{url:string, publicId:string|null}>}
   */
  async file(file, { folder = "nearmart" } = {}) {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return apiClient.upload("/uploads", form);
  },

  /** Convenience wrapper for image picker inputs. */
  async image(file, folder) {
    return this.file(file, { folder: folder || "nearmart/images" });
  },
};

export default {
  categoryService,
  productService,
  shopService,
  offerService,
  reviewService,
  notificationService,
  customerService,
  uploadService,
};