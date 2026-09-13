import { Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "../context/AdminContext";
import AdminShell from "../components/AdminShell";

import AdminDashboard from "./Dashboard";

// Approvals
import ShopkeeperApprovals from "../approvals/ShopkeeperApprovals";
import ShopkeeperApprovalDetails from "../approvals/ShopkeeperApprovalDetails";
import DeliveryPartnerApprovals from "../approvals/DeliveryPartnerApprovals";
import DeliveryPartnerApprovalDetails from "../approvals/DeliveryPartnerApprovalDetails";

// Users
import Customers from "../users/Customers";
import CustomerDetails from "../users/CustomerDetails";
import Shopkeepers from "../users/Shopkeepers";
import ShopkeeperDetails from "../users/ShopkeeperDetails";
import DeliveryPartners from "../users/DeliveryPartners";
import DeliveryPartnerDetails from "../users/DeliveryPartnerDetails";

// Shops
import Shops from "../shops/Shops";
import ShopDetails from "../shops/ShopDetails";
import ShopTypeRequests from "../shops/ShopTypeRequests";

// Products
import Products from "../products/Products";
import ProductDetails from "../products/ProductDetails";

// Orders
import Orders from "../orders/Orders";
import OrderDetails from "../orders/OrderDetails";

// Deliveries
import DeliveryMonitoring from "../deliveries/DeliveryMonitoring";
import DeliveryDetails from "../deliveries/DeliveryDetails";

// Payments
import Payments from "../payments/Payments";
import PaymentDetails from "../payments/PaymentDetails";

// Offers
import Offers from "../offers/Offers";
import OfferDetails from "../offers/OfferDetails";

// Reports
import Reports from "../reports/Reports";
import SalesReports from "../reports/SalesReports";
import UserReports from "../reports/UserReports";
import DeliveryReports from "../reports/DeliveryReports";

// Notifications
import Notifications from "../notifications/Notifications";

// Settings
import AdminProfile from "../settings/AdminProfile";
import AdminSettings from "../settings/AdminSettings";

function AdminEntry() {
  return (
    <AdminProvider>
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
    </AdminProvider>
  );
}

export default AdminEntry;
