/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { deliveryService } from "../../../services/orderService";
import { customerService, notificationService, uploadService } from "../../../services/catalogService";
import { useAuth } from "../../../context/AuthContext";

const DeliveryPartnerContext = createContext(null);

/**
 * Delivery-partner state comes from `/api/delivery/*`.
 *
 * The database owns availability, the application/approval status, the active
 * assignment, history and earnings, so nothing here is seeded with sample
 * deliveries or persisted to localStorage.
 *
 * Two things stay local, both UI-only:
 *  - `agreedToGuidelines` — a checkbox the partner has to tick in the wizard
 *  - `documentsData` — files uploaded during onboarding. The files themselves are
 *    stored through `POST /api/uploads`; only the pending list of returned URLs is
 *    kept locally because the API has no delivery-document table yet.
 */

const UI_ONLY_KEY = "nearmart_dp_ui";

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

const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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

const ORDER_STATUS_TO_UI = {
  pending: "pending",
  confirmed: "accepted",
  preparing: "preparing",
  ready_for_pickup: "ready_for_pickup",
  picked_up: "picked_up",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
  completed: "completed",
  cancelled: "cancelled",
  failed: "failed",
};

/** Turn an API order into the delivery-job shape the cards already render. */
const toDeliveryJob = (order, extra = {}) => {
  if (!order) return null;
  const address = order.deliveryAddress || order.address || {};
  const shop = order.shop || {};
  return {
    ...order,
    id: order.id,
    orderId: order.id,
    status: ORDER_STATUS_TO_UI[order.status] || order.status,
    shopName: shop.name || "",
    shopAddress: [shop.address, shop.city].filter(Boolean).join(", ") || "",
    shopPhone: shop.phone || "",
    customerName: order.customerName || order.customer?.name || "",
    customerPhone: order.customerPhone || order.customer?.phone || "",
    customerAddress:
      address.full || [address.line1, address.city, address.pincode].filter(Boolean).join(", ") || "",
    customerInstructions: address.instructions || "",
    items: (order.items || []).map((item) => ({
      id: item.id || item.productId,
      name: item.product?.name || item.name || "Product",
      quantity: num(item.quantity, 1),
      price: num(item.price ?? item.product?.price),
    })),
    orderAmount: num(order.total),
    deliveryFee: num(order.deliveryFee),
    distance: order.distanceKm != null ? num(order.distanceKm) : null,
    estimatedTime: order.estimatedDelivery || "",
    createdAt: order.createdAt || null,
    ...extra,
  };
};

export function DeliveryPartnerProvider({ children }) {
  const { user } = useAuth();
  const [uiState, setUiState] = useState(loadUiState);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [partner, setPartner] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [earnings, setEarnings] = useState({ total: 0, today: 0, weekly: [] });
  const [notifications, setNotifications] = useState([]);

  const patchUiState = useCallback((patch) => {
    setUiState((prev) => {
      const next = { ...prev, ...patch };
      saveUiState(next);
      return next;
    });
  }, []);

  /* ------------------------------ loaders ------------------------------ */

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, profile, available, active, history, earningsRes, notificationsRes] =
        await Promise.all([
          deliveryService.stats(),
          // /delivery/stats is an aggregate only; /delivery/profile carries the
          // persisted contact/identity/address/vehicle onboarding data.
          deliveryService.profile().catch(() => null),
          deliveryService.available().catch(() => []),
          deliveryService.active().catch(() => null),
          deliveryService.history({ limit: 50 }).then(({ items }) => items).catch(() => []),
          deliveryService.earnings().catch(() => null),
          deliveryService.notifications().catch(() => []),
        ]);

      setPartner({ ...(profile || {}), ...(stats || {}) });
      setIsOnline(Boolean(stats?.isOnline));
      setAvailableDeliveries((available || []).map((order) => toDeliveryJob(order)));
      setActiveDelivery(active ? toDeliveryJob(active.order, { assignment: active.assignment }) : null);
      setDeliveryHistory(
        (history || []).map((assignment) => ({
          ...assignment,
          id: assignment.orderId,
          orderId: assignment.orderId,
          status: ORDER_STATUS_TO_UI[assignment.status] || assignment.status,
          partnerEarning: num(assignment.partnerEarning),
          distance: assignment.distanceKm != null ? num(assignment.distanceKm) : null,
          completedAt: assignment.deliveredAt || assignment.createdAt || null,
        }))
      );
      setEarnings({
        total: num(earningsRes?.totalEarnings),
        today: num(earningsRes?.todayEarnings),
        weekly: earningsRes?.weekly || [],
      });
      setNotifications(
        (notificationsRes || []).map((n) => ({
          id: n.id,
          text: n.title || n.message || "",
          message: n.message || "",
          time: timeAgo(n.createdAt),
          read: Boolean(n.isRead),
          type: n.type || "system",
          createdAt: n.createdAt,
        }))
      );
    } catch (err) {
      setError(err?.message || "We could not load your delivery data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /* ------------------------------ profile ------------------------------ */

  const profile = useMemo(() => {
    const contact = partner?.contactData || {};
    const identity = partner?.identityData || {};
    return {
      id: partner?.id || null,
      partnerId: partner?.id || null,
      name: contact.fullName || identity.fullName || user?.name || "",
      email: contact.email || user?.email || "",
      phone: contact.phone || user?.phone || "",
      profileImage: user?.avatarUrl || "",
      rating: num(partner?.rating),
      totalDeliveries: num(partner?.totalDeliveries),
      completedDeliveries: num(partner?.completedDeliveries),
      cancelledDeliveries: num(partner?.cancelledDeliveries),
      todayDeliveries: num(partner?.todayDeliveries),
      todayEarnings: num(partner?.todayEarnings),
      totalEarnings: num(partner?.totalEarnings),
      joinedDate: partner?.createdAt
        ? new Date(partner.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
        : "",
      vehicleType: partner?.vehicleType || "",
      vehicleNumber: partner?.vehicleNumber || "",
      address: partner?.addressData || null,
      identity: identity ? { ...identity, status: identity.status || "submitted" } : null,
      verificationStatus: partner?.isApproved ? "approved" : partner?.applicationStatus || "draft",
      applicationStatus: partner?.isApproved ? "approved" : partner?.applicationStatus || "draft",
      onboardingStep: partner?.onboardingStep || "guidelines",
      isOnline: Boolean(partner?.isOnline),
    };
  }, [partner, user]);

  const applicationStatus = profile.applicationStatus;
  const isApproved = Boolean(partner?.isApproved);
  const onboardingStep = partner?.onboardingStep || uiState.onboardingStep || "guidelines";
  const hasCompletedOnboarding = ["submitted", "approved", "rejected"].includes(applicationStatus);

  /* ------------------------------ onboarding ---------------------------- */

  const saveOnboardingStep = useCallback(
    async (step, data) => {
      setActionError(null);
      try {
        // POST /delivery/onboarding persists contact/identity/address payloads and
        // flags the application as submitted on the verification step.
        const saved = await deliveryService.saveOnboardingStep(step, data);
        setPartner((prev) => ({ ...(prev || {}), ...saved }));
        patchUiState({ onboardingStep: step });
        await loadAll();
        return { ok: true, data: saved };
      } catch (err) {
        const message = err?.message || "We could not save that step.";
        setActionError(message);
        return { ok: false, error: message };
      }
    },
    [loadAll, patchUiState]
  );

  const updateOnboardingStep = useCallback((step) => saveOnboardingStep(step), [saveOnboardingStep]);

  const setContactVerified = useCallback(
    (data) => saveOnboardingStep("contact", data),
    [saveOnboardingStep]
  );

  const setIdentityVerified = useCallback(
    (data) => saveOnboardingStep("identity", data),
    [saveOnboardingStep]
  );

  const setAddressVerified = useCallback(
    (data) => saveOnboardingStep("address", data),
    [saveOnboardingStep]
  );

  const updateProfile = useCallback(
    async (updates) => {
      setActionError(null);
      try {
        // Name/phone belong to the account (`PUT /profile`); the delivery record
        // only owns the vehicle details (`PUT /delivery/profile`).
        const accountPayload = {
          name: updates.name,
          phone: updates.phone,
          avatarUrl: updates.avatarUrl,
        };
        Object.keys(accountPayload).forEach(
          (key) => accountPayload[key] === undefined && delete accountPayload[key]
        );
        if (Object.keys(accountPayload).length) {
          await customerService.updateProfile(accountPayload);
        }

        const payload = {
          vehicleType: updates.vehicleType,
          vehicleNumber: updates.vehicleNumber,
        };
        Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
        if (Object.keys(payload).length) {
          await deliveryService.updateProfile(payload);
        }
        setPartner((prev) => ({ ...(prev || {}), ...accountPayload, ...payload }));
        await loadAll();
        return { ok: true };
      } catch (err) {
        const message = err?.message || "We could not save your profile.";
        setActionError(message);
        return { ok: false, error: message };
      }
    },
    [loadAll]
  );

  /** Submit the application for admin review (no self-approval). */
  const submitApplication = useCallback(
    async (data = {}) => {
      const result = await saveOnboardingStep("verification", data);
      // The server keeps `applicationStatus = "submitted"`; only an admin can
      // approve it, so the wizard must not claim the application was approved.
      if (result.ok) patchUiState({ onboardingStep: "verification" });
      return result;
    },
    [patchUiState, saveOnboardingStep]
  );

  const agreedToGuidelines = Boolean(uiState.agreedToGuidelines);
  const agreeToGuidelines = useCallback(() => patchUiState({ agreedToGuidelines: true }), [patchUiState]);

  const documentsData = uiState.documentsData || null;
  const setDocumentsUploaded = useCallback(
    async (files) => {
      setActionError(null);
      try {
        const entries = await Promise.all(
          (files || []).map(async (file) => {
            const uploaded = await uploadService.image(file, "nearmart/delivery/documents");
            return { type: file.type, name: file.name, url: uploaded?.url || null };
          })
        );
        const next = [...(documentsData || []), ...entries];
        patchUiState({ documentsData: next });
        return { ok: true, data: next };
      } catch (err) {
        const message = err?.message || "Those documents could not be uploaded.";
        setActionError(message);
        return { ok: false, error: message };
      }
    },
    [documentsData, patchUiState]
  );

  /* ---------------------------- availability --------------------------- */

  const toggleAvailability = useCallback(async () => {
    if (!isApproved) {
      return { ok: false, error: "Your account must be approved before going online." };
    }
    setActionError(null);
    const next = !isOnline;
    try {
      await deliveryService.setOnline(next);
      setIsOnline(next);
      if (next) loadAll();
      return { ok: true, isOnline: next };
    } catch (err) {
      const message = err?.message || "We could not update your availability.";
      setActionError(message);
      return { ok: false, error: message };
    }
  }, [isApproved, isOnline, loadAll]);

  /* ----------------------------- deliveries ---------------------------- */

  const runDeliveryAction = useCallback(
    async (task) => {
      setActionError(null);
      try {
        const result = await task();
        await loadAll();
        return { success: true, message: "Updated", data: result };
      } catch (err) {
        const message = err?.message || "That delivery action could not be completed.";
        setActionError(message);
        return { success: false, message };
      }
    },
    [loadAll]
  );

  const acceptDelivery = useCallback(
    (deliveryId) => {
      const orderId = deliveryId?.orderId || deliveryId?.id || deliveryId;
      if (!isApproved) {
        return Promise.resolve({ success: false, message: "Your account must be approved before accepting deliveries." });
      }
      if (!isOnline) {
        return Promise.resolve({ success: false, message: "You must be online to accept deliveries." });
      }
      if (activeDelivery) {
        return Promise.resolve({
          success: false,
          message: "You already have an active delivery. Complete it before accepting another.",
        });
      }
      return runDeliveryAction(async () => {
        await deliveryService.accept(orderId);
        return orderId;
      }).then((result) =>
        result.success
          ? { ...result, message: `Delivery ${String(orderId).slice(0, 8)} accepted.` }
          : result
      );
    },
    [activeDelivery, isApproved, isOnline, runDeliveryAction]
  );

  /**
   * The API has no "release assignment" endpoint, so a delivery cannot be handed
   * back to the pool. Report that honestly instead of faking a local cancel.
   */
  const cancelDelivery = useCallback(() => {
    const message =
      "Cancelling an accepted delivery is not supported by the API yet. Contact support if you cannot complete this pickup.";
    setActionError(message);
    return { success: false, message };
  }, []);

  /** The API stores no pickup code, so pickup is confirmed by the partner. */
  const verifyPickup = useCallback(
    () =>
      runDeliveryAction(async () => {
        if (!activeDelivery) throw new Error("No active delivery.");
        return deliveryService.updateStatus(activeDelivery.id, "picked_up");
      }).then((result) => (result.success ? { ...result, message: "Pickup confirmed." } : result)),
    [activeDelivery, runDeliveryAction]
  );

  const startDelivery = useCallback(() => {
    if (!activeDelivery) return { success: false, message: "No active delivery." };
    if (activeDelivery.status !== "picked_up") {
      return { success: false, message: "Confirm the pickup before starting the delivery." };
    }
    return runDeliveryAction(() => deliveryService.updateStatus(activeDelivery.id, "out_for_delivery")).then(
      (result) => (result.success ? { ...result, message: "Delivery started." } : result)
    );
  }, [activeDelivery, runDeliveryAction]);

  /** No customer OTP exists server-side; completion is confirmed by the partner. */
  const verifyDeliveryOtp = useCallback(
    () =>
      ({ success: true, message: "Delivery confirmed by you." }),
    []
  );

  const completeDelivery = useCallback(() => {
    if (!activeDelivery) return { success: false, message: "No active delivery." };
    if (!["out_for_delivery", "picked_up"].includes(activeDelivery.status)) {
      return { success: false, message: "Start the delivery before completing it." };
    }
    return runDeliveryAction(() => deliveryService.updateStatus(activeDelivery.id, "delivered")).then((result) =>
      result.success ? { ...result, message: "Delivery completed." } : result
    );
  }, [activeDelivery, runDeliveryAction]);

  /* ---------------------------- notifications -------------------------- */

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = useCallback(
    (notifId) =>
      runDeliveryAction(async () => {
        await notificationService.markRead(notifId);
        setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
      }),
    [runDeliveryAction]
  );

  const markAllNotificationsRead = useCallback(async () => {
    await Promise.all(
      notifications.filter((n) => !n.read).map((n) => notificationService.markRead(n.id).catch(() => null))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  /* ------------------------------------------------------------------ */

  const value = useMemo(
    () => ({
      loading,
      error,
      actionError,
      refresh: loadAll,
      profile,
      isOnline,
      isApproved,
      applicationStatus,
      onboardingStep,
      hasCompletedOnboarding,
      identityData: partner?.identityData || null,
      contactData: partner?.contactData || null,
      addressData: partner?.addressData || null,
      documentsData,
      agreedToGuidelines,
      activeDelivery,
      deliveryHistory,
      availableDeliveries,
      earnings: {
        ...earnings,
        thisWeek: earnings.weekly.reduce((sum, row) => sum + num(row.earnings), 0),
        totalDeliveries: profile.completedDeliveries,
        averagePerDelivery: profile.completedDeliveries
          ? Math.round(earnings.total / profile.completedDeliveries)
          : 0,
        weeklyBreakdown: earnings.weekly.map((row) => ({ day: row.day, amount: num(row.earnings) })),
        recentTransactions: deliveryHistory.slice(0, 10),
      },
      notifications,
      unreadCount,
      toggleAvailability,
      acceptDelivery,
      cancelDelivery,
      verifyPickup,
      startDelivery,
      verifyDeliveryOtp,
      completeDelivery,
      markNotificationRead,
      markAllNotificationsRead,
      updateProfile,
      submitApplication,
      updateOnboardingStep,
      setContactVerified,
      setIdentityVerified,
      setAddressVerified,
      setDocumentsUploaded,
      agreeToGuidelines,
    }),
    [
      loading,
      error,
      actionError,
      loadAll,
      profile,
      isOnline,
      isApproved,
      applicationStatus,
      onboardingStep,
      hasCompletedOnboarding,
      partner,
      documentsData,
      agreedToGuidelines,
      activeDelivery,
      deliveryHistory,
      availableDeliveries,
      earnings,
      notifications,
      unreadCount,
      toggleAvailability,
      acceptDelivery,
      cancelDelivery,
      verifyPickup,
      startDelivery,
      verifyDeliveryOtp,
      completeDelivery,
      markNotificationRead,
      markAllNotificationsRead,
      updateProfile,
      submitApplication,
      updateOnboardingStep,
      setContactVerified,
      setIdentityVerified,
      setAddressVerified,
      setDocumentsUploaded,
      agreeToGuidelines,
    ]
  );

  return <DeliveryPartnerContext.Provider value={value}>{children}</DeliveryPartnerContext.Provider>;
}

export function useDeliveryPartner() {
  const ctx = useContext(DeliveryPartnerContext);
  if (!ctx) throw new Error("useDeliveryPartner must be used within DeliveryPartnerProvider");
  return ctx;
}

export default DeliveryPartnerContext;