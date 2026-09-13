import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { DeliveryPartnerProvider, useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { ToastProvider } from "../components/Toast";
import DeliveryPartnerShell from "../components/DeliveryPartnerShell";
import DeliveryPartnerDashboard from "./Dashboard";
import DeliveryGuidelines from "../onboarding/Guidelines";
import ContactVerification from "../onboarding/ContactVerification";
import IdentityVerification from "../onboarding/IdentityVerification";
import AddressVerification from "../onboarding/AddressVerification";
import DocumentsUpload from "../onboarding/DocumentsUpload";
import UnderVerification from "../onboarding/UnderVerification";
import AvailableDeliveries from "../deliveries/AvailableDeliveries";
import DeliveryDetails from "../deliveries/DeliveryDetails";
import ActiveDelivery from "../deliveries/ActiveDelivery";
import PickupVerification from "../deliveries/PickupVerification";
import PickupConfirmed from "../deliveries/PickupConfirmed";
import DeliveryVerification from "../deliveries/DeliveryVerification";
import DeliveryCompleted from "../deliveries/DeliveryCompleted";
import DeliveryHistory from "../orders/DeliveryHistory";
import OrderDetails from "../orders/OrderDetails";
import Earnings from "../earnings/Earnings";
import EarningsDetails from "../earnings/EarningsDetails";
import Notifications from "../notifications/Notifications";
import DeliveryProfile from "../profile/DeliveryProfile";
import ProfileSettings from "../profile/ProfileSettings";

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
    <Routes>
      <Route path="onboarding/guidelines" element={<DeliveryGuidelines />} />
      <Route path="onboarding/contact" element={<ContactVerification />} />
      <Route path="onboarding/identity" element={<IdentityVerification />} />
      <Route path="onboarding/address" element={<AddressVerification />} />
      <Route path="onboarding/documents" element={<DocumentsUpload />} />
      <Route path="onboarding/verification" element={<UnderVerification />} />
      <Route path="*" element={<Navigate to="/delivery/onboarding/guidelines" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  return (
    <DeliveryPartnerShell>
      <DeliveryPartnerGate />
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
