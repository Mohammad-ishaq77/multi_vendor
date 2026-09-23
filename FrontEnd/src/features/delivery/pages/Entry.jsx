import { lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { DeliveryPartnerProvider, useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { ToastProvider } from "../components/Toast";
import DeliveryPartnerShell from "../components/DeliveryPartnerShell";
import PageLoader from "../../../components/common/PageLoader";

// Lazy-loaded delivery pages (code-split on demand)
const DeliveryPartnerDashboard = lazy(() => import("./Dashboard"));
const DeliveryGuidelines = lazy(() => import("../onboarding/Guidelines"));
const ContactVerification = lazy(() => import("../onboarding/ContactVerification"));
const IdentityVerification = lazy(() => import("../onboarding/IdentityVerification"));
const AddressVerification = lazy(() => import("../onboarding/AddressVerification"));
const DocumentsUpload = lazy(() => import("../onboarding/DocumentsUpload"));
const UnderVerification = lazy(() => import("../onboarding/UnderVerification"));
const AvailableDeliveries = lazy(() => import("../deliveries/AvailableDeliveries"));
const DeliveryDetails = lazy(() => import("../deliveries/DeliveryDetails"));
const ActiveDelivery = lazy(() => import("../deliveries/ActiveDelivery"));
const PickupVerification = lazy(() => import("../deliveries/PickupVerification"));
const PickupConfirmed = lazy(() => import("../deliveries/PickupConfirmed"));
const DeliveryVerification = lazy(() => import("../deliveries/DeliveryVerification"));
const DeliveryCompleted = lazy(() => import("../deliveries/DeliveryCompleted"));
const DeliveryHistory = lazy(() => import("../orders/DeliveryHistory"));
const OrderDetails = lazy(() => import("../orders/OrderDetails"));
const Earnings = lazy(() => import("../earnings/Earnings"));
const EarningsDetails = lazy(() => import("../earnings/EarningsDetails"));
const Notifications = lazy(() => import("../notifications/Notifications"));
const DeliveryProfile = lazy(() => import("../profile/DeliveryProfile"));
const ProfileSettings = lazy(() => import("../profile/ProfileSettings"));

function DeliveryPartnerGate() {
  const location = useLocation();
  const { hasCompletedOnboarding } = useDeliveryPartner();

  const path = location.pathname;
  const isOnboardingRoute = path.startsWith("/delivery/onboarding");

  if (isOnboardingRoute) return null;

  if (!hasCompletedOnboarding) {
    return <Navigate to="/delivery/onboarding/guidelines" replace />;
  }

  if (path === "/delivery") {
    return <Navigate to="/delivery/dashboard" replace />;
  }

  return null;
}

function OnboardingRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="onboarding/guidelines" element={<DeliveryGuidelines />} />
        <Route path="onboarding/contact" element={<ContactVerification />} />
        <Route path="onboarding/identity" element={<IdentityVerification />} />
        <Route path="onboarding/address" element={<AddressVerification />} />
        <Route path="onboarding/documents" element={<DocumentsUpload />} />
        <Route path="onboarding/verification" element={<UnderVerification />} />
        <Route path="*" element={<Navigate to="/delivery/onboarding/guidelines" replace />} />
      </Routes>
    </Suspense>
  );
}

function AppRoutes() {
  return (
    <DeliveryPartnerShell>
      <DeliveryPartnerGate />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/delivery/dashboard" replace />} />
          <Route path="dashboard" element={<DeliveryPartnerDashboard />} />
          <Route path="available" element={<AvailableDeliveries />} />
          <Route path="details/:deliveryId" element={<DeliveryDetails />} />
          <Route path="active" element={<ActiveDelivery />} />
          <Route path="pickup" element={<PickupVerification />} />
          <Route path="pickup-confirmed" element={<PickupConfirmed />} />
          <Route path="verify" element={<DeliveryVerification />} />
          <Route path="completed" element={<DeliveryCompleted />} />
          <Route path="history" element={<DeliveryHistory />} />
          <Route path="order/:orderId" element={<OrderDetails />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="earnings/:earningId" element={<EarningsDetails />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<DeliveryProfile />} />
          <Route path="profile/settings" element={<ProfileSettings />} />
          <Route path="*" element={<Navigate to="/delivery/dashboard" replace />} />
        </Routes>
      </Suspense>
    </DeliveryPartnerShell>
  );
}

function DeliveryPartnerRoutes() {
  const { hasCompletedOnboarding } = useDeliveryPartner();
  const location = useLocation();
  const isOnboardingRoute = location.pathname.startsWith("/delivery/onboarding");

  if (isOnboardingRoute) {
    return <OnboardingRoutes />;
  }

  return hasCompletedOnboarding ? <AppRoutes /> : <OnboardingRoutes />;
}

export default function DeliveryPartnerEntry() {
  return (
    <ToastProvider>
      <DeliveryPartnerProvider>
        <DeliveryPartnerRoutes />
      </DeliveryPartnerProvider>
    </ToastProvider>
  );
}