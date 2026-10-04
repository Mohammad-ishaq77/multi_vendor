import apiClient from "./apiClient";

/**
 * Cart, wishlist and addresses.
 *
 * The backend is the single source of truth for all three, so a cart survives a
 * refresh or a re-login on any device. Nothing here writes to localStorage.
 */

export const cartService = {
  /** GET /api/cart */
  async list() {
    return (await apiClient.get("/cart")) || [];
  },

  /** POST /api/cart/items — the API increments an existing line itself. */
  async addItem(productId, quantity = 1) {
    return apiClient.post("/cart/items", { productId, quantity });
  },

  /** PUT /api/cart/items/:id */
  async updateQuantity(itemId, quantity) {
    return apiClient.put(`/cart/items/${encodeURIComponent(itemId)}`, { quantity });
  },

  /** DELETE /api/cart/items/:id */
  async removeItem(itemId) {
    return apiClient.delete(`/cart/items/${encodeURIComponent(itemId)}`);
  },
};

export const wishlistService = {
  /** GET /api/wishlist */
  async list() {
    return (await apiClient.get("/wishlist")) || [];
  },

  /** POST /api/wishlist */
  async add(productId) {
    return apiClient.post("/wishlist", { productId });
  },

  /** DELETE /api/wishlist/:productId */
  async remove(productId) {
    return apiClient.delete(`/wishlist/${encodeURIComponent(productId)}`);
  },
};

export const addressService = {
  /** GET /api/addresses */
  async list() {
    return (await apiClient.get("/addresses")) || [];
  },

  /** POST /api/addresses */
  async create(payload) {
    return apiClient.post("/addresses", payload);
  },

  /** PUT /api/addresses/:id */
  async update(id, payload) {
    return apiClient.put(`/addresses/${encodeURIComponent(id)}`, payload);
  },

  /** DELETE /api/addresses/:id */
  async remove(id) {
    return apiClient.delete(`/addresses/${encodeURIComponent(id)}`);
  },

  /** Mark one address as the default (backend clears the others). */
  async setDefault(id) {
    return apiClient.put(`/addresses/${encodeURIComponent(id)}`, { isDefault: true });
  },
};

export default { cartService, wishlistService, addressService };