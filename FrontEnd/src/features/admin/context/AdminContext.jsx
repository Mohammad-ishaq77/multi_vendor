/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminService } from "../../../services/orderService";
import {
  notificationService,
  offerService,
  productService,
  shopService,
  subscribeToShopProfileUpdates,
} from "../../../services/catalogService";
import { useAuth } from "../../../context/AuthContext";
import {
  normalizeOffers,
  normalizeOrder,
  normalizeOrders,
  normalizePayments,
  normalizeProducts,
  normalizeShops,
  normalizeUser,
  normalizeUsers,
} from "../../../utils/normalize";

const AdminContext = createContext(null);

/**
 * Admin state comes from `/api/admin/*`, `/api/users`, `/api/approvals`,
 * `/api/offers`, `/api/payments` and `/api/reports`.
 *
 * The database is the source of truth for users, shops, products, orders,
 * deliveries, payments, offers and approvals — nothing is seeded with dummy rows
 * or written to localStorage.
 *
 * Only two things stay local, both display-only:
 *  - `settings` — platform preferences the API has no table for
 *  - `activityLog` — actions taken in this session, shown next to the activity
 *    feed that is derived from real records
 *
 * Features the API does not implement (user reports, shop-type requests,
 * "request changes" on an approval) return an explicit message instead of
 * pretending to succeed.
 */

/** The backend caps `limit` at 100 per page. */
const LIST_LIMIT = 100;

const SETTINGS_KEY = "nearmart_admin_settings";

const DEFAULT_SETTINGS = {
  platformName: "NearMart",
  supportEmail: "support@nearmart.in",
  supportPhone: "",
  maxDeliveryDistance: 20,
  deliveryFeeRules: [],
  minOrderRules: [],
  deliveryPartnerPercentage: 80,
  platformPercentage: 20,
};

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* storage is optional */
  }
};

const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Admin screens filter on these labels, which the API does not store verbatim. */
const shopStatus = (shop) => {
  if (!shop) return "pending";
  if (!shop.isApproved) return "pending";
  return shop.isOpen ? "active" : "suspended";
};

const partnerStatus = (user) => (user?.isActive === false ? "inactive" : "active");

/** Turn an approval row into the shape the approval cards render. */
const enrichApproval = (approval, { usersById, shopsByOwnerId }) => {
  if (!approval) return null;
  const applicant = usersById[approval.applicantId] || null;
  const shop = shopsByOwnerId[approval.applicantId] || null;
  const isDelivery = approval.type === "delivery_partner";
  const contact = approval.contactData || {};
  const identity = approval.identityData || {};
  const applicantName =
    approval.applicantName || contact.fullName || identity.fullName || applicant?.name || "";
  return {
    ...approval,
    type: approval.type,
    status: approval.status,
    applicantName,
    name: applicantName,
    email: approval.email || contact.email || applicant?.email || "",
    phone: approval.phone || contact.phone || applicant?.phone || "",
    appliedAt: approval.appliedAt || null,
    date: approval.appliedAt || null,
    submittedAt: approval.appliedAt || null,
    reviewedAt: approval.reviewedAt || null,
    shopName: shop?.name || "",
    shopType: shop?.type || "",
    // The API stores a single review note; it has no separate change-request state.
    rejectionReason: approval.status === "rejected" ? approval.notes || "" : "",
    changesMessage: "",
    vehicleType: approval.vehicleType || "",
    vehicleNumber: approval.vehicleNumber || "",
    documents: isDelivery ? [] : shop?.documents || null,
  };
};

export function AdminProvider({ children }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [offers, setOffers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settings, setSettings] = useState(loadSettings);

  /* ------------------------------ loaders ------------------------------ */

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        statsRes,
        usersRes,
        shopsRes,
        productsRes,
        ordersRes,
        assignmentsRes,
        paymentsRes,
        approvalsRes,
        offersRes,
        notificationsRes,
        analyticsRes,
      ] = await Promise.all([
        adminService.stats(),
        adminService.users({ limit: LIST_LIMIT }).then(({ items }) => items),
        adminService.shops({ limit: LIST_LIMIT }).then(({ items }) => items),
        adminService.products({ limit: LIST_LIMIT }).then(({ items }) => items),
        adminService.orders({ limit: LIST_LIMIT }).then(({ items }) => items),
        adminService.deliveries({ limit: LIST_LIMIT }).then(({ items }) => items),
        adminService.payments({ limit: LIST_LIMIT }).then(({ items }) => items).catch(() => []),
        adminService.approvals({ limit: LIST_LIMIT }).then(({ items }) => items),
        offerService.list().catch(() => []),
        notificationService.list({ limit: 50 }).then(({ items }) => items).catch(() => []),
        adminService.reports().catch(() => null),
      ]);

      setStats(statsRes || null);
      setUsers(normalizeUsers(usersRes));
      setShops(normalizeShops(shopsRes));
      setProducts(normalizeProducts(productsRes));
      setOrders(normalizeOrders(ordersRes));
      setAssignments(assignmentsRes || []);
      setPayments(normalizePayments(paymentsRes));
      setApprovals(approvalsRes || []);
      setOffers(normalizeOffers(offersRes));
      setNotifications(
        (notificationsRes || []).map((n) => ({
          ...n,
          id: n.id,
          title: n.title || n.message || "",
          message: n.message || "",
          read: Boolean(n.isRead),
          isRead: Boolean(n.isRead),
          type: n.type || "system",
          createdAt: n.createdAt || null,
        }))
      );
      setAnalytics(analyticsRes || null);
    } catch (err) {
      setError(err?.message || "We could not load the admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll, refreshToken]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") loadAll();
    };
    window.addEventListener("focus", refreshWhenVisible);
    const unsubscribe = subscribeToShopProfileUpdates(refreshWhenVisible);
    const refreshInterval = window.setInterval(refreshWhenVisible, 30_000);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      unsubscribe();
      window.clearInterval(refreshInterval);
    };
  }, [loadAll]);

  /* ---------------------------- derived views --------------------------- */

  const customers = useMemo(() => {
    const byId = new Map(
      orders
        .filter((order) => order.status !== "cancelled")
        .map((order) => [order.customerId, order])
    );
    const spent = new Map();
    const counted = new Map();
    orders.forEach((order) => {
      if (!order.customerId) return;
      counted.set(order.customerId, (counted.get(order.customerId) || 0) + 1);
      if (order.status !== "cancelled") {
        spent.set(
          order.customerId,
          (spent.get(order.customerId) || 0) + num(order.totalAmount)
        );
      }
    });
    void byId;
    return users
      .filter((u) => u.role === "customer")
      .map((u) => ({
        ...u,
        totalOrders: counted.get(u.id) || 0,
        totalSpent: num(spent.get(u.id)),
        revenue: num(spent.get(u.id)),
      }));
  }, [orders, users]);

  const shopkeepers = useMemo(() => {
    const shopByOwner = new Map(shops.map((shop) => [shop.ownerId, shop]));
    const spent = new Map();
    const counted = new Map();
    orders.forEach((order) => {
      const ownerId = shopByOwner.get(order.shopId)?.ownerId;
      if (!ownerId) return;
      counted.set(ownerId, (counted.get(ownerId) || 0) + 1);
      if (order.status !== "cancelled") {
        spent.set(ownerId, (spent.get(ownerId) || 0) + num(order.totalAmount));
      }
    });
    return users
      .filter((u) => u.role === "shopkeeper")
      .map((u) => {
        const shop = shopByOwner.get(u.id) || null;
        return {
          ...u,
          shopName: shop?.name || "",
          shopId: shop?.id || null,
          shopStatus: shopStatus(shop),
          totalOrders: counted.get(u.id) || 0,
          totalSpent: num(spent.get(u.id)),
          revenue: num(spent.get(u.id)),
        };
      });
  }, [orders, shops, users]);

  const deliveryPartners = useMemo(() => {
    const aggregates = new Map();
    assignments.forEach((assignment) => {
      if (!assignment.partnerId && !assignment.userId && !assignment.deliveryPartnerId) return;
      const partnerId = assignment.userId || assignment.deliveryPartnerId || assignment.partnerId;
      const entry = aggregates.get(partnerId) || { deliveries: 0, earnings: 0 };
      entry.deliveries += 1;
      entry.earnings += num(assignment.partnerEarning);
      aggregates.set(partnerId, entry);
    });
    return users
      .filter((u) => u.role === "delivery")
      .map((u) => {
        const entry = aggregates.get(u.id) || { deliveries: 0, earnings: 0 };
        return {
          ...u,
          userId: u.id,
          status: partnerStatus(u),
          isActive: u.isActive !== false,
          totalDeliveries: entry.deliveries,
          earnings: entry.earnings,
          totalEarnings: entry.earnings,
          // Not exposed by any admin endpoint.
          rating: null,
          vehicleType: null,
          vehicleNumber: null,
        };
      });
  }, [assignments, users]);

  const shopRows = useMemo(() => {
    const ordersByShop = new Map();
    orders.forEach((order) => {
      const entry = ordersByShop.get(order.shopId) || { count: 0, revenue: 0 };
      entry.count += 1;
      if (order.status !== "cancelled") entry.revenue += num(order.totalAmount);
      ordersByShop.set(order.shopId, entry);
    });
    const productsByShop = new Map();
    products.forEach((product) => {
      productsByShop.set(product.shopId, (productsByShop.get(product.shopId) || 0) + 1);
    });
    return shops.map((shop) => {
      const entry = ordersByShop.get(shop.id) || { count: 0, revenue: 0 };
      return {
        ...shop,
        status: shopStatus(shop),
        totalOrders: entry.count,
        totalRevenue: entry.revenue,
        totalProducts: productsByShop.get(shop.id) || 0,
        totalRatings: shop.totalReviews || 0,
        products: products.filter((product) => product.shopId === shop.id),
      };
    });
  }, [orders, products, shops]);

  const enrichedApprovals = useMemo(() => {
    const usersById = Object.fromEntries(users.map((u) => [u.id, u]));
    const shopsByOwnerId = Object.fromEntries(
      shops.filter((shop) => shop.ownerId).map((shop) => [shop.ownerId, shop])
    );
    return approvals.map((approval) => enrichApproval(approval, { usersById, shopsByOwnerId }));
  }, [approvals, shops, users]);

  const deliveries = useMemo(
    () =>
      assignments.map((assignment) => ({
        ...assignment,
        id: assignment.id,
        orderId: assignment.orderId,
        status: assignment.status || null,
        partnerId: assignment.userId || assignment.deliveryPartnerId || null,
        partnerEarning: num(assignment.partnerEarning),
        pickedUpAt: assignment.pickedUpAt || null,
        deliveredAt: assignment.deliveredAt || null,
        createdAt: assignment.createdAt || null,
      })),
    [assignments]
  );

  const recentActivities = useMemo(() => {
    const events = [];
    orders.slice(0, 25).forEach((order) => {
      events.push({
        id: `order-${order.id}`,
        type: "order",
        message: `Order ${String(order.id).slice(0, 8)} placed by ${order.customerName || "a customer"}`,
        timestamp: order.createdAt,
      });
    });
    enrichedApprovals.slice(0, 25).forEach((approval) => {
      events.push({
        id: `approval-${approval.id}`,
        type: "approval",
        message: `${approval.type === "delivery_partner" ? "Delivery partner" : "Shopkeeper"} application from ${
          approval.applicantName || "an applicant"
        } is ${approval.status}`,
        timestamp: approval.appliedAt || approval.reviewedAt,
      });
    });
    shopRows.slice(0, 25).forEach((shop) => {
      events.push({
        id: `shop-${shop.id}`,
        type: "shop",
        message: `${shop.name} joined the marketplace`,
        timestamp: shop.createdAt,
      });
    });
    const sorted = events
      .filter((event) => event.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
    return [...activityLog, ...sorted].slice(0, 30);
  }, [activityLog, enrichedApprovals, orders, shopRows]);

  const adminProfile = useMemo(
    () => ({
      id: user?.id || null,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "admin",
      avatar: user?.avatarUrl || null,
      joinedDate: user?.createdAt || null,
    }),
    [user]
  );

  const totalRevenue = useMemo(() => {
    if (stats?.revenue != null) return num(stats.revenue);
    return orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + num(order.totalAmount), 0);
  }, [orders, stats]);

  const totalPlatformEarnings = null;
  const openReportsCount = 0;

  const pendingApprovalsCount = enrichedApprovals.filter((a) => a.status === "pending").length;

  const addActivity = useCallback((activity) => {
    const entry = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: activity?.type || "system",
      message: activity?.message || "",
      timestamp: new Date().toISOString(),
    };
    setActivityLog((prev) => [entry, ...prev].slice(0, 10));
  }, []);

  /* ------------------------------- actions ------------------------------ */

  const runAction = useCallback(
    async (task, { successMessage, after } = {}) => {
      setActionError(null);
      try {
        const data = await task();
        if (typeof after === "function") after(data);
        if (successMessage) addActivity({ type: "system", message: successMessage });
        await loadAll();
        return { success: true, data, message: "Updated" };
      } catch (err) {
        const message = err?.message || "That action could not be completed.";
        setActionError(message);
        return { success: false, message };
      }
    },
    [addActivity, loadAll]
  );

  /* Users */

  const setUserActive = useCallback(
    (id, isActive) =>
      runAction(() => adminService.updateUser(id, { isActive }), {
        successMessage: `Account ${isActive ? "reactivated" : "suspended"}`,
        after: (updated) =>
          setUsers((prev) => prev.map((u) => (u.id === updated?.id ? normalizeUser(updated) : u))),
      }),
    [runAction]
  );

  const suspendUser = useCallback((id) => setUserActive(id, false), [setUserActive]);
  const activateUser = useCallback((id) => setUserActive(id, true), [setUserActive]);

  /* Shops */

  const setShopApproved = useCallback(
    (id, isApproved) =>
      runAction(() => shopService.moderate(id, { isApproved }), {
        successMessage: `Shop ${isApproved ? "activated" : "suspended"}`,
        after: (updated) =>
          setShops((prev) => prev.map((s) => (s.id === updated?.id ? { ...s, ...updated } : s))),
      }),
    [runAction]
  );

  const suspendShop = useCallback((id) => setShopApproved(id, false), [setShopApproved]);
  const activateShop = useCallback((id) => setShopApproved(id, true), [setShopApproved]);

  /* Products */

  const setProductAvailable = useCallback(
    (id, isAvailable) =>
      runAction(() => productService.update(id, { isAvailable }), {
        successMessage: `Product ${isAvailable ? "enabled" : "disabled"}`,
        after: (updated) =>
          setProducts((prev) => prev.map((p) => (p.id === updated?.id ? { ...p, ...updated } : p))),
      }),
    [runAction]
  );

  const disableProduct = useCallback((id) => setProductAvailable(id, false), [setProductAvailable]);
  const enableProduct = useCallback((id) => setProductAvailable(id, true), [setProductAvailable]);

  /* Orders */

  const updateOrderStatus = useCallback(
    (orderId, status) =>
      runAction(() => adminService.updateOrderStatus(orderId, status), {
        successMessage: `Order status set to ${status}`,
        after: (updated) =>
          setOrders((prev) => prev.map((o) => (o.id === updated?.id ? normalizeOrder(updated) : o))),
      }),
    [runAction]
  );

  const calculateOrderRevenue = useCallback(
    (order) => (order?.status === "cancelled" ? 0 : num(order?.totalAmount)),
    []
  );

  /* Approvals */

  const reviewApproval = useCallback(
    (id, status, notes) =>
      runAction(() => adminService.reviewApproval(id, status, notes), {
        successMessage: `Application ${status}`,
        after: (updated) =>
          setApprovals((prev) => prev.map((a) => (a.id === updated?.id ? { ...a, ...updated } : a))),
      }),
    [runAction]
  );

  const approveShopkeeper = useCallback((id, notes) => reviewApproval(id, "approved", notes), [reviewApproval]);
  const rejectShopkeeper = useCallback((id, notes) => reviewApproval(id, "rejected", notes), [reviewApproval]);
  const approveDeliveryPartner = useCallback(
    (id, notes) => reviewApproval(id, "approved", notes),
    [reviewApproval]
  );
  const rejectDeliveryPartner = useCallback(
    (id, notes) => reviewApproval(id, "rejected", notes),
    [reviewApproval]
  );

  const requestShopkeeperChanges = useCallback(
    (id, message) => reviewApproval(id, "rejected", message),
    [reviewApproval]
  );
  const requestDeliveryPartnerChanges = useCallback(
    (id, message) => reviewApproval(id, "rejected", message),
    [reviewApproval]
  );

  const unsupported = useCallback((what) => {
    const message = `${what} is not supported by the API yet.`;
    setActionError(message);
    return { success: false, message };
  }, []);

  /* Offers */

  const createOffer = useCallback(
    (payload) =>
      runAction(() => offerService.create(payload), {
        successMessage: `Offer "${payload?.title || payload?.code || ""}" created`,
      }),
    [runAction]
  );

  const updateOffer = useCallback(
    (id, updates) =>
      runAction(() => offerService.update(id, updates), {
        successMessage: `Offer ${id} updated`,
      }),
    [runAction]
  );

  const activateOffer = useCallback(
    (id) => updateOffer(id, { isActive: true, status: "active" }),
    [updateOffer]
  );
  const deactivateOffer = useCallback(
    (id) => updateOffer(id, { isActive: false, status: "inactive" }),
    [updateOffer]
  );

  const deleteOffer = useCallback(
    (id) =>
      runAction(() => offerService.remove(id), {
        successMessage: `Offer ${id} deleted`,
      }),
    [runAction]
  );

  /* Reports — the API exposes analytics at /reports, not a complaint queue. */

  const reports = useMemo(() => [], []);
  const resolveReport = useCallback(() => unsupported("Resolving user reports"), [unsupported]);
  const rejectReport = useCallback(() => unsupported("Rejecting user reports"), [unsupported]);

  /* Shop type requests — no API table exists. */
  const shopTypeRequests = useMemo(() => [], []);
  const approveShopType = useCallback(() => unsupported("Approving shop type requests"), [unsupported]);
  const rejectShopType = useCallback(() => unsupported("Rejecting shop type requests"), [unsupported]);

  /* Notifications */

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = useCallback(
    (id) =>
      runAction(() => notificationService.markRead(id), {
        after: () =>
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
          ),
      }),
    [runAction]
  );

  const markAllNotificationsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (!unread.length) return { success: true };
    setActionError(null);
    const results = await Promise.allSettled(
      unread.map((n) => notificationService.markRead(n.id))
    );
    if (results.some((r) => r.status === "rejected")) {
      const message = "Some notifications could not be marked as read.";
      setActionError(message);
      return { success: false, message };
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    return { success: true };
  }, [notifications]);

  /* ------------------------------ profile ------------------------------- */

  const updateAdminProfile = useCallback(
    (updates) => {
      // `PATCH /users/:id` accepts name/phone only - email and roles are
      // account-level fields the API does not let a profile form change.
      const payload = {
        name: updates.name,
        phone: updates.phone,
      };
      Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
      return runAction(() => adminService.updateUser(user.id, payload), {
        successMessage: "Profile updated",
      });
    },
    [runAction, user]
  );

  /* ------------------------------ settings ------------------------------ */

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const handleSidebarToggle = useCallback(() => setSidebarCollapsed((prev) => !prev), []);

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  /* ---------------------------- context value --------------------------- */

  const value = useMemo(
    () => ({
      loading,
      error,
      actionError,
      refresh,

      sidebarCollapsed,
      setSidebarCollapsed: handleSidebarToggle,

      adminProfile,
      updateAdminProfile,

      customers,
      shopkeepers,
      deliveryPartners,

      shops: shopRows,
      products,

      orders,
      deliveries,
      payments,

      offers,
      createOffer,
      updateOffer,
      activateOffer,
      deactivateOffer,
      deleteOffer,

      reports,
      resolveReport,
      rejectReport,
      analytics,

      notifications,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,

      shopTypeRequests,
      approveShopType,
      rejectShopType,

      approvals: enrichedApprovals,
      pendingApprovalsCount,
      pendingShopTypeRequestsCount: shopTypeRequests.length,
      approveShopkeeper,
      rejectShopkeeper,
      requestShopkeeperChanges,
      approveDeliveryPartner,
      rejectDeliveryPartner,
      requestDeliveryPartnerChanges,

      settings,
      updateSettings,

      recentActivities,
      addActivity,

      suspendUser,
      activateUser,

      suspendShop,
      activateShop,

      disableProduct,
      enableProduct,

      updateOrderStatus,

      stats,
      openReportsCount,
      totalRevenue,
      totalPlatformEarnings,

      calculateOrderRevenue,
    }),
    [
      loading,
      error,
      actionError,
      refresh,
      sidebarCollapsed,
      handleSidebarToggle,
      adminProfile,
      updateAdminProfile,
      customers,
      shopkeepers,
      deliveryPartners,
      shopRows,
      products,
      orders,
      deliveries,
      payments,
      offers,
      createOffer,
      updateOffer,
      activateOffer,
      deactivateOffer,
      deleteOffer,
      reports,
      resolveReport,
      rejectReport,
      analytics,
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
      shopTypeRequests,
      approveShopType,
      rejectShopType,
      enrichedApprovals,
      pendingApprovalsCount,
      approveShopkeeper,
      rejectShopkeeper,
      requestShopkeeperChanges,
      approveDeliveryPartner,
      rejectDeliveryPartner,
      requestDeliveryPartnerChanges,
      settings,
      updateSettings,
      recentActivities,
      addActivity,
      suspendUser,
      activateUser,
      suspendShop,
      activateShop,
      disableProduct,
      enableProduct,
      updateOrderStatus,
      stats,
      openReportsCount,
      totalRevenue,
      totalPlatformEarnings,
      calculateOrderRevenue,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export default AdminContext;