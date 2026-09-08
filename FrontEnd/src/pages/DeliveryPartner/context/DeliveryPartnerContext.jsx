import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { deliveryPartnerProfile, defaultNotifications, defaultEarnings } from "../data/deliveryPartnerData";
import { dummyDeliveries } from "../data/dummyDeliveries";

const DeliveryPartnerContext = createContext(null);

const LS_PREFIX = "nearmart_dp_";
const LS_KEYS = {
  profile: `${LS_PREFIX}profile`,
  isOnline: `${LS_PREFIX}isOnline`,
  applicationStatus: `${LS_PREFIX}applicationStatus`,
  onboardingStep: `${LS_PREFIX}onboardingStep`,
  activeDelivery: `${LS_PREFIX}activeDelivery`,
  deliveryHistory: `${LS_PREFIX}deliveryHistory`,
  availableDeliveries: `${LS_PREFIX}availableDeliveries`,
  earnings: `${LS_PREFIX}earnings`,
  notifications: `${LS_PREFIX}notifications`,
  identityData: `${LS_PREFIX}identityData`,
  addressData: `${LS_PREFIX}addressData`,
  documentsData: `${LS_PREFIX}documentsData`,
  agreedToGuidelines: `${LS_PREFIX}agreedToGuidelines`,
};

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silent
  }
}

export function DeliveryPartnerProvider({ children }) {
  const [profile, setProfile] = useState(() => loadLS(LS_KEYS.profile, deliveryPartnerProfile));
  const [isOnline, setIsOnline] = useState(() => loadLS(LS_KEYS.isOnline, false));
  const [applicationStatus, setApplicationStatus] = useState(() => loadLS(LS_KEYS.applicationStatus, "approved"));
  const [onboardingStep, setOnboardingStep] = useState(() => loadLS(LS_KEYS.onboardingStep, "approved"));
  const [activeDelivery, setActiveDelivery] = useState(() => loadLS(LS_KEYS.activeDelivery, null));
  const [deliveryHistory, setDeliveryHistory] = useState(() => loadLS(LS_KEYS.deliveryHistory, dummyDeliveries.filter((d) => d.status === "completed")));
  const [availableDeliveries, setAvailableDeliveries] = useState(() => loadLS(LS_KEYS.availableDeliveries, dummyDeliveries.filter((d) => d.status === "ready_for_pickup")));
  const [earnings, setEarnings] = useState(() => loadLS(LS_KEYS.earnings, defaultEarnings));
  const [notifications, setNotifications] = useState(() => loadLS(LS_KEYS.notifications, defaultNotifications));
  const [identityData, setIdentityData] = useState(() => loadLS(LS_KEYS.identityData, null));
  const [addressData, setAddressData] = useState(() => loadLS(LS_KEYS.addressData, null));
  const [documentsData, setDocumentsData] = useState(() => loadLS(LS_KEYS.documentsData, null));
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(() => loadLS(LS_KEYS.agreedToGuidelines, false));

  useEffect(() => { saveLS(LS_KEYS.profile, profile); }, [profile]);
  useEffect(() => { saveLS(LS_KEYS.isOnline, isOnline); }, [isOnline]);
  useEffect(() => { saveLS(LS_KEYS.applicationStatus, applicationStatus); }, [applicationStatus]);
  useEffect(() => { saveLS(LS_KEYS.onboardingStep, onboardingStep); }, [onboardingStep]);
  useEffect(() => { saveLS(LS_KEYS.activeDelivery, activeDelivery); }, [activeDelivery]);
  useEffect(() => { saveLS(LS_KEYS.deliveryHistory, deliveryHistory); }, [deliveryHistory]);
  useEffect(() => { saveLS(LS_KEYS.availableDeliveries, availableDeliveries); }, [availableDeliveries]);
  useEffect(() => { saveLS(LS_KEYS.earnings, earnings); }, [earnings]);
  useEffect(() => { saveLS(LS_KEYS.notifications, notifications); }, [notifications]);
  useEffect(() => { saveLS(LS_KEYS.identityData, identityData); }, [identityData]);
  useEffect(() => { saveLS(LS_KEYS.addressData, addressData); }, [addressData]);
  useEffect(() => { saveLS(LS_KEYS.documentsData, documentsData); }, [documentsData]);
  useEffect(() => { saveLS(LS_KEYS.agreedToGuidelines, agreedToGuidelines); }, [agreedToGuidelines]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((text, type = "system") => {
    const newNotif = { id: `N${Date.now()}`, text, time: "Just now", read: false, type };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const toggleAvailability = useCallback(() => {
    setIsOnline((prev) => !prev);
  }, []);

  const acceptDelivery = useCallback((deliveryId) => {
    if (!isOnline) return { success: false, message: "You must be online to accept deliveries." };
    if (activeDelivery) return { success: false, message: "You already have an active delivery. Complete it before accepting another." };
    const delivery = availableDeliveries.find((d) => d.id === deliveryId);
    if (!delivery) return { success: false, message: "Delivery not found." };
    const updated = { ...delivery, status: "accepted" };
    setActiveDelivery(updated);
    setAvailableDeliveries((prev) => prev.filter((d) => d.id !== deliveryId));
    addNotification(`Delivery ${deliveryId} accepted successfully.`);
    return { success: true, message: `Delivery ${deliveryId} accepted successfully.` };
  }, [activeDelivery, availableDeliveries, isOnline, addNotification]);

  const cancelDelivery = useCallback(() => {
    if (!activeDelivery) return;
    const cancelled = { ...activeDelivery, status: "cancelled", completedAt: new Date().toISOString() };
    setDeliveryHistory((prev) => [cancelled, ...prev]);
    setAvailableDeliveries((prev) => [...prev, { ...activeDelivery, status: "ready_for_pickup" }]);
    setActiveDelivery(null);
    addNotification(`Delivery ${activeDelivery.id} was cancelled.`);
  }, [activeDelivery, addNotification]);

  const verifyPickup = useCallback((pickupCode) => {
    if (!activeDelivery) return { success: false, message: "No active delivery." };
    if (activeDelivery.status !== "accepted") return { success: false, message: "Pickup verification is not available for this delivery." };
    if (activeDelivery.pickupVerificationCode === pickupCode) {
      setActiveDelivery((prev) => ({ ...prev, status: "pickup_verified" }));
      addNotification(`Pickup verified for ${activeDelivery.id}.`);
      return { success: true, message: "Pickup verified successfully." };
    }
    return { success: false, message: "Pickup verification failed. Check the Order ID and pickup code." };
  }, [activeDelivery, addNotification]);

  const startDelivery = useCallback(() => {
    if (!activeDelivery || activeDelivery.status !== "pickup_verified") return false;
    setActiveDelivery((prev) => ({ ...prev, status: "out_for_delivery" }));
    addNotification(`Delivery ${activeDelivery.id} started.`);
    return true;
  }, [activeDelivery, addNotification]);

  const verifyDeliveryOtp = useCallback((otp) => {
    if (!activeDelivery) return { success: false, message: "No active delivery." };
    if (activeDelivery.status !== "out_for_delivery") return { success: false, message: "Customer OTP can only be verified after pickup." };
    if (activeDelivery.deliveryOtp === otp) {
      setActiveDelivery((prev) => ({ ...prev, status: "otp_verified" }));
      addNotification(`OTP verified for ${activeDelivery.id}.`);
      return { success: true, message: "Delivery verified successfully." };
    }
    return { success: false, message: "Incorrect OTP. Please try again." };
  }, [activeDelivery, addNotification]);

  const completeDelivery = useCallback(() => {
    if (!activeDelivery || activeDelivery.status !== "otp_verified") return false;
    const completed = { ...activeDelivery, status: "completed", completedAt: new Date().toISOString() };
    setDeliveryHistory((prev) => [completed, ...prev]);
    setActiveDelivery(null);
    setEarnings((prev) => ({
      ...prev,
      today: prev.today + activeDelivery.partnerEarning,
      thisWeek: prev.thisWeek + activeDelivery.partnerEarning,
      thisMonth: prev.thisMonth + activeDelivery.partnerEarning,
      total: prev.total + activeDelivery.partnerEarning,
      totalDeliveries: prev.totalDeliveries + 1,
    }));
    setProfile((prev) => ({
      ...prev,
      todayDeliveries: prev.todayDeliveries + 1,
      completedDeliveries: prev.completedDeliveries + 1,
      todayEarnings: prev.todayEarnings + activeDelivery.partnerEarning,
      totalEarnings: prev.totalEarnings + activeDelivery.partnerEarning,
    }));
    addNotification(`₹${activeDelivery.partnerEarning} earning added for ${activeDelivery.id}.`);
    return true;
  }, [activeDelivery, addNotification]);

  const markNotificationRead = useCallback((notifId) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const submitApplication = useCallback(() => {
    setApplicationStatus("pending");
    setOnboardingStep("pending");
    addNotification("Your application has been submitted for review.");
  }, [addNotification]);

  const simulateApproval = useCallback(() => {
    setApplicationStatus("approved");
    setOnboardingStep("approved");
    setProfile((prev) => ({ ...prev, verificationStatus: "approved", applicationStatus: "approved" }));
    addNotification("Admin approved your account.");
  }, [addNotification]);

  const updateOnboardingStep = useCallback((step) => {
    setOnboardingStep(step);
  }, []);

  const setIdentityVerified = useCallback((data) => {
    setIdentityData(data);
    setProfile((prev) => ({ ...prev, identity: { ...prev.identity, ...data, status: "verified" } }));
  }, []);

  const setAddressVerified = useCallback((data) => {
    setAddressData(data);
    setProfile((prev) => ({ ...prev, address: data }));
  }, []);

  const setDocumentsUploaded = useCallback((data) => {
    setDocumentsData(data);
  }, []);

  const agreeToGuidelines = useCallback(() => {
    setAgreedToGuidelines(true);
  }, []);

  const value = {
    profile,
    isOnline,
    applicationStatus,
    onboardingStep,
    activeDelivery,
    deliveryHistory,
    availableDeliveries,
    earnings,
    notifications,
    unreadCount,
    identityData,
    addressData,
    documentsData,
    agreedToGuidelines,
    toggleAvailability,
    acceptDelivery,
    cancelDelivery,
    verifyPickup,
    startDelivery,
    verifyDeliveryOtp,
    completeDelivery,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    updateProfile,
    submitApplication,
    simulateApproval,
    updateOnboardingStep,
    setIdentityVerified,
    setAddressVerified,
    setDocumentsUploaded,
    agreeToGuidelines,
  };

  return (
    <DeliveryPartnerContext.Provider value={value}>
      {children}
    </DeliveryPartnerContext.Provider>
  );
}

export function useDeliveryPartner() {
  const ctx = useContext(DeliveryPartnerContext);
  if (!ctx) throw new Error("useDeliveryPartner must be used within DeliveryPartnerProvider");
  return ctx;
}

export default DeliveryPartnerContext;
