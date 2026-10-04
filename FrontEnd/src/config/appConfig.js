export const APP_CONFIG = {
  name: "NearMart",
  tagline: "Your Local Marketplace, Delivered",
  description:
    "Discover groceries, fashion, electronics, beauty and more from trusted local sellers — all in one place.",
  logo: "/logo/logo.png",
  favicon: "/favicon.ico",
  heroImage: "/images/hero-img.png",
  loginArt: "/images/loginBg.png",
  supportEmail: "support@nearmart.com",
  supportPhone: "+91 98765 43210",
};

/**
 * Client-only storage keys.
 *
 * Only UI preferences and non-sensitive client state belong here. Server-backed
 * data (cart, orders, addresses, wishlist, shop, deliveries) lives in the API —
 * see `src/services/*` — and session tokens are owned by `tokenService`.
 */
export const STORAGE_KEYS = {
  THEME: "nearmart_theme",
  ADMIN_SIDEBAR_COLLAPSED: "nearmart_admin_sidebar_collapsed",
  SHOPKEEPER_SETTINGS: "nearmart_sk_settings",
  FAVORITE_SHOPS: "nearmart_favorite_shops",
  READ_NOTIFICATIONS: "nearmart_read_notifications",
};

export default APP_CONFIG;
