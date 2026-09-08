import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { DeliveryPartnerProvider, useDeliveryPartner } from "./context/DeliveryPartnerContext";
import { ToastProvider } from "./components/Toast";
import DeliveryPartnerShell from "./components/DeliveryPartnerShell";
import DeliveryPartnerDashboard from "./DeliveryPartnerDashboard";
import DeliveryGuidelines from "./onboarding/DeliveryGuidelines";
import IdentityVerification from "./onboarding/IdentityVerification";
import AddressVerification from "./onboarding/AddressVerification";
import DocumentsUpload from "./onboarding/DocumentsUpload";
import DeliveryApproval from "./onboarding/DeliveryApproval";
import AvailableDeliveries from "./deliveries/AvailableDeliveries";
import DeliveryDetails from "./deliveries/DeliveryDetails";
import ActiveDelivery from "./deliveries/ActiveDelivery";
import PickupVerification from "./deliveries/PickupVerification";
import PickupConfirmed from "./deliveries/PickupConfirmed";
import DeliveryVerification from "./deliveries/DeliveryVerification";
import DeliveryCompleted from "./deliveries/DeliveryCompleted";
import DeliveryHistory from "./orders/DeliveryHistory";
import OrderDetails from "./orders/OrderDetails";
import Earnings from "./earnings/Earnings";
import EarningsDetails from "./earnings/EarningsDetails";
import Notifications from "./notifications/Notifications";
import DeliveryProfile from "./profile/DeliveryProfile";
import ProfileSettings from "./profile/ProfileSettings";

function DeliveryPartnerGate() {
  const location = useLocation();
  const { applicationStatus } = useDeliveryPartner();

  const isOnboardingRoute = location.pathname.startsWith("/delivery/onboarding") || location.pathname.startsWith("/deliverypartner/onboarding");
  const isApproved = applicationStatus === "approved";

  if (!isApproved && !isOnboardingRoute) {
    return <Navigate to="/deliverypartner/onboarding/guidelines" replace />;
  }

  if (isApproved && (location.pathname === "/delivery" || location.pathname === "/deliverypartner")) {
    return <Navigate to="/delivery/dashboard" replace />;
  }

  return null;
}

function DeliveryPartnerRoutes() {
  const gate = <DeliveryPartnerGate />;

  return (
    <DeliveryPartnerShell>
      {gate}
      <Routes>
        <Route path="/" element={<Navigate to="/deliverypartner/dashboard" replace />} />
        <Route path="dashboard" element={<DeliveryPartnerDashboard />} />
        <Route path="onboarding/guidelines" element={<DeliveryGuidelines />} />
        <Route path="onboarding/identity" element={<IdentityVerification />} />
        <Route path="onboarding/address" element={<AddressVerification />} />
        <Route path="onboarding/documents" element={<DocumentsUpload />} />
        <Route path="onboarding/approval" element={<DeliveryApproval />} />
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
        <Route path="*" element={<Navigate to="/deliverypartner/dashboard" replace />} />
      </Routes>
    </DeliveryPartnerShell>
  );
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
