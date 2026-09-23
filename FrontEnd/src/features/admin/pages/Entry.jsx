import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "../context/AdminContext";
import AdminShell from "../components/AdminShell";
import PageLoader from "../../../components/common/PageLoader";

// Lazy-loaded admin pages (code-split on demand)
const AdminDashboard = lazy(() => import("./Dashboard"));

// Approvals
const ShopkeeperApprovals = lazy(() => import("../approvals/ShopkeeperApprovals"));
const ShopkeeperApprovalDetails = lazy(() => import("../approvals/ShopkeeperApprovalDetails"));
const DeliveryPartnerApprovals = lazy(() => import("../approvals/DeliveryPartnerApprovals"));
const DeliveryPartnerApprovalDetails = lazy(() => import("../approvals/DeliveryPartnerApprovalDetails"));

// Users
const Customers = lazy(() => import("../users/Customers"));
const CustomerDetails = lazy(() => import("../users/CustomerDetails"));
const Shopkeepers = lazy(() => import("../users/Shopkeepers"));
const ShopkeeperDetails = lazy(() => import("../users/ShopkeeperDetails"));
const DeliveryPartners = lazy(() => import("../users/DeliveryPartners"));
const DeliveryPartnerDetails = lazy(() => import("../users/DeliveryPartnerDetails"));

// Shops
const Shops = lazy(() => import("../shops/Shops"));
const ShopDetails = lazy(() => import("../shops/ShopDetails"));
const ShopTypeRequests = lazy(() => import("../shops/ShopTypeRequests"));

// Products
const Products = lazy(() => import("../products/Products"));
const ProductDetails = lazy(() => import("../products/ProductDetails"));

// Orders
const Orders = lazy(() => import("../orders/Orders"));
const OrderDetails = lazy(() => import("../orders/OrderDetails"));

// Deliveries
const DeliveryMonitoring = lazy(() => import("../deliveries/DeliveryMonitoring"));
const DeliveryDetails = lazy(() => import("../deliveries/DeliveryDetails"));

// Payments
const Payments = lazy(() => import("../payments/Payments"));
const PaymentDetails = lazy(() => import("../payments/PaymentDetails"));

// Offers
const Offers = lazy(() => import("../offers/Offers"));
const OfferDetails = lazy(() => import("../offers/OfferDetails"));

// Reports
const Reports = lazy(() => import("../reports/Reports"));
const SalesReports = lazy(() => import("../reports/SalesReports"));
const UserReports = lazy(() => import("../reports/UserReports"));
const DeliveryReports = lazy(() => import("../reports/DeliveryReports"));

// Notifications
const Notifications = lazy(() => import("../notifications/Notifications"));

// Settings
const AdminProfile = lazy(() => import("../settings/AdminProfile"));
const AdminSettings = lazy(() => import("../settings/AdminSettings"));

function AdminEntry() {
  return (
    <AdminProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AdminShell />}>
            {/* Dashboard */}
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Approvals */}
            <Route path="approvals/shopkeepers" element={<ShopkeeperApprovals />} />
            <Route path="approvals/shopkeepers/:id" element={<ShopkeeperApprovalDetails />} />
            <Route path="approvals/delivery-partners" element={<DeliveryPartnerApprovals />} />
            <Route path="approvals/delivery-partners/:id" element={<DeliveryPartnerApprovalDetails />} />

            {/* Users */}
            <Route path="users/customers" element={<Customers />} />
            <Route path="users/customers/:customerId" element={<CustomerDetails />} />
            <Route path="users/shopkeepers" element={<Shopkeepers />} />
            <Route path="users/shopkeepers/:shopkeeperId" element={<ShopkeeperDetails />} />
            <Route path="users/delivery-partners" element={<DeliveryPartners />} />
            <Route path="users/delivery-partners/:partnerId" element={<DeliveryPartnerDetails />} />

            {/* Shops */}
            <Route path="shops" element={<Shops />} />
            <Route path="shops/:shopId" element={<ShopDetails />} />
            <Route path="shops/requests" element={<ShopTypeRequests />} />

            {/* Products */}
            <Route path="products" element={<Products />} />
            <Route path="products/:productId" element={<ProductDetails />} />

            {/* Orders */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />

            {/* Deliveries */}
            <Route path="deliveries" element={<DeliveryMonitoring />} />
            <Route path="deliveries/:orderId" element={<DeliveryDetails />} />

            {/* Payments */}
            <Route path="payments" element={<Payments />} />
            <Route path="payments/:orderId" element={<PaymentDetails />} />

            {/* Offers */}
            <Route path="offers" element={<Offers />} />
            <Route path="offers/:offerId" element={<OfferDetails />} />

            {/* Reports */}
            <Route path="reports" element={<Reports />} />
            <Route path="reports/sales" element={<SalesReports />} />
            <Route path="reports/users" element={<UserReports />} />
            <Route path="reports/delivery" element={<DeliveryReports />} />

            {/* Notifications */}
            <Route path="notifications" element={<Notifications />} />

            {/* Settings */}
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />

            {/* Catch-all → dashboard */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminProvider>
  );
}

export default AdminEntry;