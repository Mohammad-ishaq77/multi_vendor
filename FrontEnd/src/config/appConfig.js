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

export const STORAGE_KEYS = {
  AUTH: "nearmart_auth",
  USER: "nearmart_user",
  ROLE: "nearmart_role",
  SESSION: "nearmart_session",
  PERSIST: "nearmart_persist_session",
  SHOPKEEPER_ONBOARDING: "nearmart_sk_onboarding",
  SHOPKEEPER_SHOP: "nearmart_sk_shop",
  SHOPKEEPER_ORDERS: "nearmart_sk_orders",
  ADMIN_ORDERS: "nearmart_admin_orders",
  DELIVERY_ONBOARDING: "nearmart_dp_hasCompletedOnboarding",
  DELIVERY_STATUS: "nearmart_dp_applicationStatus",
  ORDERS: "nearmart_orders",
  LAST_ORDER: "nearmart_last_order",
  PAYMENTS: "nearmart_payments",
};

export const AUTH_STORAGE_KEYS = [
  STORAGE_KEYS.AUTH,
  STORAGE_KEYS.USER,
  STORAGE_KEYS.ROLE,
  STORAGE_KEYS.SESSION,
];

export const TEST_CREDENTIALS = {
  email: "test@gmail.com",
  aliases: ["test@gmail", "test@gmail.com"],
  password: "1122",
};

export default APP_CONFIG;
