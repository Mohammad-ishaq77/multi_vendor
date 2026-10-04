/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { shopkeeperService } from "../../../services/orderService";
import {
  shopService,
  notificationService,
  productService,
  uploadService,
  offerService,
  categoryService,
} from "../../../services/catalogService";
import {
  normalizeShop,
  normalizeProduct,
  normalizeProducts,
  normalizeOrders,
  normalizeOffer,
  normalizeOffers,
  normalizeReviews,
  normalizeCategories,
  normalizeUser,
} from "../../../utils/normalize";
import { useAuth } from "../../../context/AuthContext";

const ShopkeeperContext = createContext(null);

/**
 * Shopkeeper state is owned by the API.
 *
 * Nothing here is seeded with sample data: `products`, `orders`, `offers`,
 * `reviews`, `earnings` and `notifications` all come from
 * `/api/shopkeeper/*` and `/api/notifications`, and every mutation re-reads the
 * server so the UI can never drift from the database.
 *
 * Only two things stay local, both of them UI-only:
 *  - `onboardingStep` â€” which screen of the wizard you are looking at
 *  - `shopSettings` â€” notification/display preferences that have no server model
 */

/* ---------------- status translation between UI and API ---------------- */

export const ORDER_FLOW_UI = ["New", "Accepted", "Preparing", "Ready for Pickup", "Picked Up", "Delivered", "Completed"];

/** API status -> label used by the shopkeeper screens. */
const API_TO_UI_STATUS = {
  pending: "New",
  confirmed: "Accepted",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  out_for_delivery: "Picked Up",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** UI label -> API status sent to PATCH /shopkeeper/orders/:id/status. */
const UI_TO_API_STATUS = {
  New: "pending",
  Accepted: "confirmed",
  Preparing: "preparing",
  "Ready for Pickup": "ready_for_pickup",
  "Picked Up": "out_for_delivery",
  Delivered: "delivered",
  Completed: "completed",
  Cancelled: "cancelled",
};

const DEFAULT_SHOP = {
  id: null,
  name: "",
  description: "",
  type: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  openingTime: "",
  closingTime: "",
  isOpen: false,
  isApproved: false,
  rating: 0,
  totalReviews: 0,
  deliveryTime: "",
  minOrder: 0,
  shopImage: null,
  bannerImage: null,
  logoImage: null,
  documents: [],
};

const DEFAULT_SETTINGS = {
  acceptOrders: true,
  autoAccept: false,
  emailNotifications: true,
  smsNotifications: false,
  orderAlerts: true,
  lowStockAlerts: true,
  reviewAlerts: true,
  promoUpdates: false,
};

const UI_ONLY_KEY = "nearmart_sk_ui";

const loadUiState = () => {
  try {
    const raw = localStorage.getItem(UI_ONLY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveUiState = (state) => {
  try {
    localStorage.setItem(UI_ONLY_KEY, JSON.stringify(state));
  } catch {
    /* storage is optional */
  }
};

/** Add the shopkeeper screen aliases to an API order. */
const withUiStatus = (order) => {
  if (!order) return order;
  return {
    ...order,
    apiStatus: order.status,
    status: API_TO_UI_STATUS[order.status] || order.status,
    customer: order.customerName,
    phone: order.customerPhone,
  };
};

const timeAgo = (value) => {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export function ShopkeeperProvider({ children }) {
  const { user } = useAuth();
  const [uiState, setUiState] = useState(loadUiState);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [profile, applyProfile] = useState(() => normalizeUser(user) || {});
  const [shop, setShopState] = useState(DEFAULT_SHOP);
  const [shopStatus, setShopStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [shopTypes, setShopTypes] = useState([]);

  const patchUiState = useCallback((patch) => {
    setUiState((prev) => {
      const next = { ...prev, ...patch };
      saveUiState(next);
      return next;
    });
  }, []);

  /* ------------------------------ loaders ------------------------------ */

  const loadShop = useCallback(async () => {
    try {
      const mine = await shopService.mine();
      const normalized = normalizeShop(mine) || DEFAULT_SHOP;
      setShopState(normalized);
      return normalized;
    } catch (err) {
      // 404 simply means onboarding has not created the shop yet.
      if (err?.status !== 404) setError(err?.message || "Could not load your shop.");
      setShopState(DEFAULT_SHOP);
      return null;
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, profileRes] = await Promise.all([
        shopkeeperService.status(),
        shopkeeperService.profile().catch(() => user ? normalizeUser(user) : null),
      ]);

      setShopStatus(statusRes);
      if (profileRes) applyProfile(normalizeUser(profileRes) || profile);

      // A shop must exist before the shop-scoped endpoints work, so during
      // onboarding only the shop-level data is requested.
      const hasShop = Boolean(statusRes?.shop);
      if (hasShop) {
        await loadShop();
        const [productsRes, ordersRes, offersRes, reviewsRes, earningsRes, notificationsRes] =
          await Promise.all([
            shopkeeperService.products({ limit: 100 }).then(({ items }) => normalizeProducts(items)),
            shopkeeperService.orders({ limit: 100 }).then(({ items }) => normalizeOrders(items).map(withUiStatus)),
            shopkeeperService.offers().then((items) => normalizeOffers(items)),
            shopkeeperService.reviews({ limit: 50 }).then(({ items }) => normalizeReviews(items)),
            shopkeeperService.earnings().catch(() => null),
            notificationService.list({ limit: 20 }).then(({ items }) => items).catch(() => []),
          ]);

        setProducts(productsRes);
        setOrders(ordersRes);
        setOffers(offersRes);
        setReviews(reviewsRes);
        setEarnings({
          total: Number(earningsRes?.revenue || 0),
          revenue: Number(earningsRes?.revenue || 0),
          orderCount: Number(earningsRes?.orders || 0),
          daily: earningsRes?.daily || [],
        });
        setNotifications(
          (notificationsRes || []).map((n) => ({
            id: n.id,
            text: n.title || n.message || "",
            message: n.message || "",
            time: timeAgo(n.createdAt),
            read: Boolean(n.isRead),
            type: n.type || "general",
            createdAt: n.createdAt,
          }))
        );
      } else {
        setProducts([]);
        setOrders([]);
        setOffers([]);
        setReviews([]);
        setEarnings(null);
        setNotifications([]);
      }

      setShopTypes(await categoryService.list().then((items) => normalizeCategories(items)).catch(() => []));
    } catch (err) {
      setError(err?.message || "We could not load your shop data.");
    } finally {
      setLoading(false);
    }
  }, [loadShop, profile, user]);

  useEffect(() => {
    if (user) applyProfile((prev) => ({ ...normalizeUser(user), ...prev }));
  }, [user]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------- onboarding state ------------------------- */

  const serverOnboardingStep = useMemo(() => {
    if (!shopStatus) return null;
    if (!shopStatus.shop) return "type_selection";
    if (shopStatus.approval?.status === "approved" || shopStatus.shop.isApproved) return "approved";
    if (shopStatus.approval) return "approval";
    return "documents";
  }, [shopStatus]);

  const onboardingStep = useMemo(() => {
    if (uiState.onboardingStep && serverOnboardingStep !== "approved") {
      return uiState.onboardingStep;
    }
    return serverOnboardingStep || uiState.onboardingStep || "type_selection";
  }, [serverOnboardingStep, uiState.onboardingStep]);

  const setOnboardingStep = useCallback(
    (step) => {
      // The wizard step is pure UI: `PUT /shopkeeper/onboarding/step` only echoes
      // the value back, so the durable progress signal is the shop + approval rows.
      patchUiState({ onboardingStep: step });
    },
    [patchUiState]
  );

  /* ------------------------------ mutations ---------------------------- */

  const runAction = useCallback(async (task, { successMessage } = {}) => {
    setActionError(null);
    try {
      const result = await task();
      await loadAll();
      return { ok: true, data: result, message: successMessage };
    } catch (err) {
      const message = err?.message || "That action could not be completed.";
      setActionError(message);
      return { ok: false, error: message, issues: err?.issues || null };
    }
  }, [loadAll]);

  /** Merge UI edits locally and persist whatever the API supports. */
  const setShop = useCallback(
    async (updates) => {
      const next = typeof updates === "function" ? updates(shop) : { ...shop, ...updates };

      if (!shop.id) {
        setShopState(next);
        return { ok: true, data: next };
      }

      try {
        const updateKeys = typeof updates === "function" ? [] : Object.keys(updates);
        const onlyOpenStatus = updateKeys.length === 1 && updateKeys[0] === "isOpen";
        if (onlyOpenStatus) {
          const updated = await shopService.setOpen(Boolean(next.isOpen));
          const normalized = normalizeShop(updated) || next;
          setShopState(normalized);
          return { ok: true, data: normalized };
        }

        // Persist profile fields separately from the open/closed toggle. Full
        // shop forms also contain `isOpen`, so checking only for that property
        // would silently skip saving the edited profile.
        const payload = {
          name: next.name?.trim(),
          description: next.description,
          phone: next.phone,
          email: next.email?.trim() || null,
          address: next.address,
          city: next.city,
          state: next.state,
          pincode: next.pincode,
          categoryId: next.categoryId || null,
          openingTime: next.openingTime || null,
          closingTime: next.closingTime || null,
          deliveryTime: next.deliveryTime || null,
          minOrder: next.minOrder != null ? Number(next.minOrder) : undefined,
        };
        ["shopImage", "bannerImage", "logoImage"].forEach((key) => {
          const value = next[key];
          if (value === null) {
            payload[key] = null;
          } else if (
            typeof value === "string" &&
            value &&
            !value.startsWith("blob:") &&
            !value.startsWith("data:")
          ) {
            payload[key] = value;
          }
        });
        Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
        const updated = Object.keys(payload).length ? await shopService.updateMine(payload) : shop;
        const statusChanged =
          updateKeys.includes("isOpen") && Boolean(next.isOpen) !== Boolean(shop.isOpen);
        const statusUpdated = statusChanged
          ? await shopService.setOpen(Boolean(next.isOpen))
          : updated;
        const normalized = normalizeShop(statusUpdated) || next;
        setShopState(normalized);
        return { ok: true, data: normalized };
      } catch (err) {
        const message = err?.message || "Could not save your shop.";
        setActionError(message);
        return { ok: false, error: message };
      }
    },
    [shop]
  );

  const createShop = useCallback(
    (payload) => runAction(() => shopService.create(payload), { successMessage: "Shop created" }),
    [runAction]
  );

  const addProduct = useCallback(
    (product) =>
      runAction(async () => {
        const payload = {
          name: product.name,
          description: product.description || "",
          price: Number(product.price),
          mrp: product.originalPrice ? Number(product.originalPrice) : Number(product.price),
          discountPct: Number(product.discount || 0),
          unit: product.unit || "",
          stock: Number(product.stock || 0),
          isAvailable: product.available !== false,
        };
        const categoryId = product.categoryId?.trim();
        const imageUrl = product.imageUrl || (typeof product.image === "string" ? product.image : "");
        if (categoryId) payload.categoryId = categoryId;
        if (imageUrl) payload.imageUrl = imageUrl;
        const created = await productService.create(payload);
        return normalizeProduct(created);
      }, { successMessage: "Product added" }),
    [runAction]
  );

  const updateProduct = useCallback(
    (id, updates) =>
      runAction(async () => {
        const payload = {
          name: updates.name,
          description: updates.description,
          categoryId: updates.categoryId,
          price: updates.price != null ? Number(updates.price) : undefined,
          mrp: updates.originalPrice != null ? Number(updates.originalPrice) : undefined,
          discountPct: updates.discount != null ? Number(updates.discount) : undefined,
          unit: updates.unit,
          stock: updates.stock != null ? Number(updates.stock) : undefined,
          imageUrl: updates.image ?? updates.imageUrl,
          isAvailable: updates.available ?? updates.isAvailable,
        };
        Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
        return normalizeProduct(await productService.update(id, payload));
      }, { successMessage: "Product updated" }),
    [runAction]
  );

  const deleteProduct = useCallback(
    (id) => runAction(() => productService.remove(id), { successMessage: "Product removed" }),
    [runAction]
  );

  const uploadImage = useCallback(async (file, folder) => {
    const result = await uploadService.image(file, folder || "nearmart/shops");
    return result?.url || null;
  }, []);

  /**
   * Upload a verification document and record it against the shop.
   * `POST /uploads` stores the file, `POST /shopkeeper/documents` records the URL
   * so an admin can review it in the approvals queue.
   */
  const uploadDocument = useCallback(
    async (type, file) => {
      setActionError(null);
      try {
        if (!shop.id) throw new Error("Create your shop before uploading documents.");
        const uploaded = await uploadService.image(file, "nearmart/shops/documents");
        if (!uploaded?.url) throw new Error("The file could not be uploaded.");
        const record = await shopkeeperService.addDocument({ shopId: shop.id, type, url: uploaded.url });
        setDocuments((prev) => [
          ...prev.filter((d) => d.type !== type),
          {
            id: record?.id || `${type}-${Date.now()}`,
            type,
            url: uploaded.url,
            stub: Boolean(uploaded.stub),
            createdAt: record?.createdAt || new Date().toISOString(),
          },
        ]);
        return { ok: true, url: uploaded.url };
      } catch (err) {
        const message = err?.message || "That document could not be uploaded.";
        setActionError(message);
        return { ok: false, error: message };
      }
    },
    [shop.id]
  );

  /** UI status -> server status. Only the shop's own order flow is allowed. */
  const updateOrderStatus = useCallback(
    (orderId, uiStatus) =>
      runAction(async () => {
        const apiStatus = UI_TO_API_STATUS[uiStatus];
        if (!apiStatus) throw new Error(`"${uiStatus}" is not a valid order status.`);
        return shopkeeperService.updateOrderStatus(orderId, apiStatus);
      }, { successMessage: `Order marked ${uiStatus}` }),
    [runAction]
  );

  const getNextStatus = useCallback((currentStatus) => {
    const idx = ORDER_FLOW_UI.indexOf(currentStatus);
    if (idx < 0 || idx >= ORDER_FLOW_UI.length - 1) return null;
    return ORDER_FLOW_UI[idx + 1];
  }, []);

  const addOffer = useCallback(
    (offer) =>
      runAction(async () => {
        const payload = {
          title: offer.title || offer.name,
          description: offer.description || "",
          discountType: offer.type === "percentage" ? "percentage" : "flat",
          discountValue: Number(offer.value ?? offer.discountValue ?? 0),
          minOrder: Number(offer.minOrder || 0),
          maxDiscount: Number(offer.maxDiscount || 0),
          code: (offer.code || offer.couponCode || "").toUpperCase() || undefined,
        };
        if (offer.validFrom) payload.startsAt = new Date(offer.validFrom).toISOString();
        if (offer.validTill) payload.expiresAt = new Date(offer.validTill).toISOString();
        const created = await shopkeeperService.createOffer(payload);
        return normalizeOffer(created);
      }, { successMessage: "Offer created" }),
    [runAction]
  );

  const toggleOfferActive = useCallback(
    (offerId) =>
      runAction(async () => {
        const current = offers.find((o) => o.id === offerId);
        return offerService.update(offerId, { isActive: !(current?.active ?? true) });
      }),
    [offers, runAction]
  );

  const deleteOffer = useCallback(
    (offerId) => runAction(() => offerService.remove(offerId), { successMessage: "Offer deleted" }),
    [runAction]
  );

  const markNotificationRead = useCallback(
    (notifId) =>
      runAction(async () => {
        await notificationService.markRead(notifId);
        setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
      }),
    [runAction]
  );

  const markAllNotificationsRead = useCallback(async () => {
    setActionError(null);
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) => notificationService.markRead(n.id).catch(() => null))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* individual failures are already swallowed above */
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const setProfile = useCallback(
    (updates) =>
      runAction(async () => {
        const next = typeof updates === "function" ? updates(profile) : { ...profile, ...updates };
        const payload = {
          name: next.name,
          phone: next.phone,
          avatarUrl: next.image || next.avatar || undefined,
        };
        Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
        const saved = await shopkeeperService.updateProfile(payload);
        applyProfile(normalizeUser(saved) || next);
        return saved;
      }, { successMessage: "Profile updated" }),
    [profile, runAction]
  );

  /* ------------------- earnings derived from real orders ---------------- */

  const derivedEarnings = useMemo(() => {
    const base = earnings || { total: 0, revenue: 0, orderCount: 0, daily: [] };
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const paid = orders.filter((o) => o.apiStatus !== "cancelled");
    const today = paid.filter((o) => o.createdAt && new Date(o.createdAt) >= startOfToday);
    const completed = paid.filter((o) => o.apiStatus === "completed" || o.apiStatus === "delivered");

    return {
      total: base.total,
      today: today.reduce((sum, o) => sum + Number(o.total || 0), 0),
      // The server reports a rolling 30-day window, so this is that window.
      thisMonth: Number(base.daily?.reduce((sum, row) => sum + Number(row.revenue || 0), 0) || 0),
      lastMonth: 0,
      pendingSettlement: paid
        .filter((o) => o.paymentStatus !== "paid" && o.paymentStatus !== "refunded")
        .reduce((sum, o) => sum + Number(o.total || 0), 0),
      completedOrders: completed.length,
      averageOrderValue: paid.length
        ? Math.round(paid.reduce((sum, o) => sum + Number(o.total || 0), 0) / paid.length)
        : 0,
      transactions: paid.slice(0, 10).map((o) => ({
        id: o.id,
        orderId: o.id,
        amount: Number(o.total || 0),
        date: o.createdAt,
        status: o.paymentStatus === "paid" ? "Settled" : "Pending",
        method: o.paymentMethod || "â€”",
      })),
    };
  }, [earnings, orders]);

  const isApproved = shop?.isApproved === true || shopStatus?.shop?.isApproved === true;

  const shopSettings = uiState.shopSettings || DEFAULT_SETTINGS;
  const setShopSettings = useCallback(
    (updates) => {
      setUiState((prev) => {
        const nextSettings =
          typeof updates === "function"
            ? updates(prev.shopSettings || DEFAULT_SETTINGS)
            : { ...(prev.shopSettings || DEFAULT_SETTINGS), ...updates };
        const next = { ...prev, shopSettings: nextSettings };
        saveUiState(next);
        return next;
      });
    },
    []
  );

  /* ------------------------------------------------------------------ */

  const value = useMemo(
    () => ({
      loading,
      error,
      actionError,
      refresh: loadAll,
      serverOnboardingStep,
      onboardingStep,
      setOnboardingStep,
      profile,
      setProfile,
      shop,
      setShop,
      createShop,
      isApproved,
      shopStatus,
      shopTypes,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      uploadImage,
      documents,
      uploadDocument,
      orders,
      updateOrderStatus,
      getNextStatus,
      offers,
      addOffer,
      toggleOfferActive,
      deleteOffer,
      reviews,
      earnings: derivedEarnings,
      notifications,
      unreadCount,
      markNotificationRead,
      markAllNotificationsRead,
      shopSettings,
      setShopSettings,
    }),
    [
      loading,
      error,
      actionError,
      loadAll,
      serverOnboardingStep,
      onboardingStep,
      setOnboardingStep,
      profile,
      setProfile,
      shop,
      setShop,
      createShop,
      isApproved,
      shopStatus,
      shopTypes,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      uploadImage,
      documents,
      uploadDocument,
      orders,
      updateOrderStatus,
      getNextStatus,
      offers,
      addOffer,
      toggleOfferActive,
      deleteOffer,
      reviews,
      derivedEarnings,
      notifications,
      unreadCount,
      markNotificationRead,
      markAllNotificationsRead,
      shopSettings,
      setShopSettings,
    ]
  );

  return <ShopkeeperContext.Provider value={value}>{children}</ShopkeeperContext.Provider>;
}

/* Offer edit/delete use the shared /api/offers endpoints (shopkeeper or admin). */
export function useShopkeeper() {
  const ctx = useContext(ShopkeeperContext);
  if (!ctx) throw new Error("useShopkeeper must be used within ShopkeeperProvider");
  return ctx;
}

export default ShopkeeperContext;