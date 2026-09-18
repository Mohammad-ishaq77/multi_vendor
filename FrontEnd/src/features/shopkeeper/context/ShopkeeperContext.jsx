import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  shopkeeperProfile as defaultProfile,
  shopData as defaultShop,
  shopProducts as defaultProducts,
  shopOrders as defaultOrders,
  shopOffers as defaultOffers,
  shopReviews as defaultReviews,
  shopEarnings as defaultEarnings,
  shopNotifications as defaultNotifications,
} from "../data/shopkeeperData";
import { orderStatusFlow } from "../data/dummyOrders";
import orderService, { ORDERS_CHANGE_EVENT } from "../../../services/orderService";

const ShopkeeperContext = createContext(null);

const LS_KEYS = {
  profile: "nearmart_sk_profile",
  shop: "nearmart_sk_shop",
  products: "nearmart_sk_products",
  orders: "nearmart_sk_orders",
  offers: "nearmart_sk_offers",
  onboarding: "nearmart_sk_onboarding",
  digilockerVerified: "nearmart_sk_digilocker",
  settings: "nearmart_sk_settings",
};

const defaultShopSettings = {
  acceptOrders: true,
  autoAccept: false,
  emailNotifications: true,
  smsNotifications: false,
  orderAlerts: true,
  lowStockAlerts: true,
  reviewAlerts: true,
  promoUpdates: false,
};

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* silent */ }
}

export function ShopkeeperProvider({ children }) {
  const [onboardingStep, setOnboardingStep] = useState(() => loadLS(LS_KEYS.onboarding, "type_selection"));
  const [profile, setProfileState] = useState(() => loadLS(LS_KEYS.profile, defaultProfile));
  const [shop, setShopState] = useState(() => loadLS(LS_KEYS.shop, defaultShop));
  const [products, setProducts] = useState(() => loadLS(LS_KEYS.products, defaultProducts));
  const [orders, setOrders] = useState(() => loadLS(LS_KEYS.orders, defaultOrders));
  const [offers, setOffers] = useState(() => loadLS(LS_KEYS.offers, defaultOffers));
  const [reviews] = useState(defaultReviews);
  const [earnings] = useState(defaultEarnings);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [digilockerVerified, setDigilockerVerified] = useState(() => loadLS(LS_KEYS.digilockerVerified, false));
  const [shopSettings, setShopSettingsState] = useState(() => ({
    ...defaultShopSettings,
    ...loadLS(LS_KEYS.settings, {}),
  }));

  useEffect(() => { saveLS(LS_KEYS.onboarding, onboardingStep); }, [onboardingStep]);
  useEffect(() => { saveLS(LS_KEYS.profile, profile); }, [profile]);
  useEffect(() => { saveLS(LS_KEYS.shop, shop); }, [shop]);
  useEffect(() => { saveLS(LS_KEYS.products, products); }, [products]);
  useEffect(() => { saveLS(LS_KEYS.orders, orders); }, [orders]);
  useEffect(() => { saveLS(LS_KEYS.offers, offers); }, [offers]);
  useEffect(() => { saveLS(LS_KEYS.digilockerVerified, digilockerVerified); }, [digilockerVerified]);
  useEffect(() => { saveLS(LS_KEYS.settings, shopSettings); }, [shopSettings]);

  useEffect(() => {
    const mergeLiveOrders = () => {
      const live = orderService.getCustomerOrders().map((order) => orderService.toShopkeeperOrder(order));
      if (!live.length) return;
      setOrders((prev) => {
        const map = new Map(prev.map((order) => [order.id, order]));
        live.forEach((order) => map.set(order.id, { ...map.get(order.id), ...order }));
        return Array.from(map.values());
      });
    };
    mergeLiveOrders();
    window.addEventListener(ORDERS_CHANGE_EVENT, mergeLiveOrders);
    window.addEventListener("storage", mergeLiveOrders);
    return () => {
      window.removeEventListener(ORDERS_CHANGE_EVENT, mergeLiveOrders);
      window.removeEventListener("storage", mergeLiveOrders);
    };
  }, []);

  const setProfile = useCallback((updates) => {
    setProfileState((prev) => {
      const next = typeof updates === "function" ? updates(prev) : { ...prev, ...updates };
      return next;
    });
  }, []);

  const setShop = useCallback((updates) => {
    setShopState((prev) => {
      const next = typeof updates === "function" ? updates(prev) : { ...prev, ...updates };
      return next;
    });
  }, []);

  const setShopSettings = useCallback((updates) => {
    setShopSettingsState((prev) => {
      const next = typeof updates === "function" ? updates(prev) : { ...prev, ...updates };
      return next;
    });
  }, []);

  const isApproved = shop?.isApproved === true;

  const addProduct = useCallback((product) => {
    const newProduct = {
      ...product,
      id: "p" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );
    const customerStatus =
      newStatus === "Delivered" || newStatus === "Completed"
        ? "Delivered"
        : newStatus === "Ready for Pickup" || newStatus === "Picked Up"
        ? "Shipped"
        : newStatus === "Cancelled"
        ? "Cancelled"
        : "Processing";
    orderService.updateCustomerOrder(orderId, {
      shopStatus: newStatus,
      status: customerStatus,
      adminStatus:
        newStatus === "Delivered" || newStatus === "Completed"
          ? "delivered"
          : newStatus === "Cancelled"
          ? "cancelled"
          : newStatus === "Ready for Pickup"
          ? "ready_for_pickup"
          : "confirmed",
    });
    const updated = orderService.getCustomerOrders().find((order) => order.id === orderId);
    if (updated) orderService.syncRoleStores(updated);
  }, []);

  const getNextStatus = useCallback((currentStatus) => {
    const idx = orderStatusFlow.indexOf(currentStatus);
    if (idx < 0 || idx >= orderStatusFlow.length - 1) return null;
    return orderStatusFlow[idx + 1];
  }, []);

  const addOffer = useCallback((offer) => {
    const newOffer = { ...offer, id: "off" + Date.now(), usedCount: 0 };
    setOffers((prev) => [newOffer, ...prev]);
    return newOffer;
  }, []);

  const toggleOfferActive = useCallback((offerId) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, active: !o.active } : o))
    );
  }, []);

  const deleteOffer = useCallback((offerId) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  }, []);

  const markNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const verifyWithDigiLocker = useCallback(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setDigilockerVerified(true);
        resolve(true);
      }, 2000);
    });
  }, []);

  const value = {
    onboardingStep,
    setOnboardingStep,
    profile,
    setProfile,
    shop,
    setShop,
    isApproved,
    digilockerVerified,
    verifyWithDigiLocker,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    getNextStatus,
    offers,
    addOffer,
    toggleOfferActive,
    deleteOffer,
    reviews,
    earnings,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    shopSettings,
    setShopSettings,
  };

  return (
    <ShopkeeperContext.Provider value={value}>
      {children}
    </ShopkeeperContext.Provider>
  );
}

export function useShopkeeper() {
  const ctx = useContext(ShopkeeperContext);
  if (!ctx) throw new Error("useShopkeeper must be used within ShopkeeperProvider");
  return ctx;
}

export default ShopkeeperContext;
