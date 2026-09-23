import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import PageLoader from "../../components/common/PageLoader";
import GuestRoute from "./GuestRoute";
import RoleRoute from "./RoleRoute";
import { ROLES } from "../../config/roles";

// Lazy-loaded route pages (code-split on demand to keep the initial bundle small)
const LandingPage = lazy(() => import("../../LandingPage/LandingPage"));
const About = lazy(() => import("../../LandingPage/About"));
const Contact = lazy(() => import("../../LandingPage/Contact"));
const CategoriesPage = lazy(() => import("../../pages/categories/CategoriesPage"));
const MarketplacePage = lazy(() => import("../../pages/marketplace/MarketplacePage"));
const MarketplaceCategoryPage = lazy(() => import("../../pages/marketplace/MarketplaceCategoryPage"));

const Login = lazy(() => import("../../features/auth/pages/Login"));
const Register = lazy(() => import("../../features/auth/pages/Register"));

const CustomerDashboard = lazy(() => import("../../features/customer/pages/Dashboard"));
const Cart = lazy(() => import("../../features/customer/cart/Cart"));
const Shops = lazy(() => import("../../features/customer/shops/Shops"));
const ShopDetails = lazy(() => import("../../features/customer/shops/ShopDetails"));
const Products = lazy(() => import("../../features/customer/products/Products"));
const ProductDetail = lazy(() => import("../../features/customer/products/ProductDetail"));
const Categories = lazy(() => import("../../features/customer/categories/Categories"));
const Checkout = lazy(() => import("../../features/customer/checkout/Checkout"));
const CustomerOrders = lazy(() => import("../../features/customer/orders/Orders"));
const CustomerOrderDetails = lazy(() => import("../../features/customer/orders/OrderDetails"));
const TrackOrder = lazy(() => import("../../features/customer/orders/TrackOrder"));
const Wishlist = lazy(() => import("../../features/customer/wishlist/Wishlist"));
const Addresses = lazy(() => import("../../features/customer/addresses/Addresses"));
const Profile = lazy(() => import("../../features/customer/profile/Profile"));
const CustomerPayments = lazy(() => import("../../features/customer/payments/Payments"));

const ShopkeeperEntry = lazy(() => import("../../features/shopkeeper/pages/Entry"));
const ShopkeeperDashboard = lazy(() => import("../../features/shopkeeper/pages/Dashboard"));
const ShopTypeSelection = lazy(() => import("../../features/shopkeeper/onboarding/ShopTypeSelection"));
const CreateShop = lazy(() => import("../../features/shopkeeper/onboarding/CreateShop"));
const ShopDocuments = lazy(() => import("../../features/shopkeeper/onboarding/ShopDocuments"));
const ShopApproval = lazy(() => import("../../features/shopkeeper/onboarding/ShopApproval"));
const MyShop = lazy(() => import("../../features/shopkeeper/shop/MyShop"));
const EditShop = lazy(() => import("../../features/shopkeeper/shop/EditShop"));
const ShopSettings = lazy(() => import("../../features/shopkeeper/shop/ShopSettings"));
const ShopProducts = lazy(() => import("../../features/shopkeeper/products/Products"));
const AddProduct = lazy(() => import("../../features/shopkeeper/products/AddProduct"));
const EditProduct = lazy(() => import("../../features/shopkeeper/products/EditProduct"));
const ShopProductDetails = lazy(() => import("../../features/shopkeeper/products/ProductDetails"));
const ShopOrders = lazy(() => import("../../features/shopkeeper/orders/Orders"));
const ShopOrderDetails = lazy(() => import("../../features/shopkeeper/orders/OrderDetails"));
const ReadyForPickup = lazy(() => import("../../features/shopkeeper/orders/ReadyForPickup"));
const ShopOffers = lazy(() => import("../../features/shopkeeper/offers/Offers"));
const CreateOffer = lazy(() => import("../../features/shopkeeper/offers/CreateOffer"));
const Earnings = lazy(() => import("../../features/shopkeeper/earnings/Earnings"));
const Reviews = lazy(() => import("../../features/shopkeeper/reviews/Reviews"));
const ShopkeeperProfile = lazy(() => import("../../features/shopkeeper/profile/ShopkeeperProfile"));

const DeliveryPartnerEntry = lazy(() => import("../../features/delivery/pages/Entry"));
const AdminEntry = lazy(() => import("../../features/admin/pages/Entry"));
const NotFound = lazy(() => import("../../pages/not-found/NotFound"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/:slug" element={<MarketplaceCategoryPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/shops" element={<Shops />} />
          <Route path="/customer/shops/:shopId" element={<ShopDetails />} />
          <Route path="/customer/products" element={<Products />} />
          <Route path="/customer/product/:id" element={<ProductDetail />} />
          <Route path="/customer/categories" element={<Categories />} />
          <Route path="/customer/checkout" element={<Checkout />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/orders/:orderId" element={<CustomerOrderDetails />} />
          <Route path="/customer/orders/:orderId/track" element={<TrackOrder />} />
          <Route path="/customer/wishlist" element={<Wishlist />} />
          <Route path="/customer/addresses" element={<Addresses />} />
          <Route path="/customer/profile" element={<Profile />} />
          <Route path="/customer/payments" element={<CustomerPayments />} />
        </Route>

        <Route
          path="/shopkeeper/*"
          element={
            <RoleRoute allowedRoles={[ROLES.SHOPKEEPER]}>
              <ShopkeeperEntry>
                <Routes>
                  <Route path="/" element={<ShopkeeperDashboard />} />
                  <Route path="dashboard" element={<ShopkeeperDashboard />} />
                  <Route path="onboarding" element={<ShopTypeSelection />} />
                  <Route path="onboarding/create-shop" element={<CreateShop />} />
                  <Route path="onboarding/documents" element={<ShopDocuments />} />
                  <Route path="onboarding/approval" element={<ShopApproval />} />
                  <Route path="shop" element={<MyShop />} />
                  <Route path="shop/edit" element={<EditShop />} />
                  <Route path="settings" element={<ShopSettings />} />
                  <Route path="products" element={<ShopProducts />} />
                  <Route path="products/add" element={<AddProduct />} />
                  <Route path="products/:id" element={<ShopProductDetails />} />
                  <Route path="products/:id/edit" element={<EditProduct />} />
                  <Route path="orders" element={<ShopOrders />} />
                  <Route path="orders/:orderId" element={<ShopOrderDetails />} />
                  <Route path="ready-for-pickup" element={<ReadyForPickup />} />
                  <Route path="offers" element={<ShopOffers />} />
                  <Route path="offers/create" element={<CreateOffer />} />
                  <Route path="earnings" element={<Earnings />} />
                  <Route path="reviews" element={<Reviews />} />
                  <Route path="profile" element={<ShopkeeperProfile />} />
                </Routes>
              </ShopkeeperEntry>
            </RoleRoute>
          }
        />

        <Route
          path="/delivery/*"
          element={
            <RoleRoute allowedRoles={[ROLES.DELIVERY]}>
              <DeliveryPartnerEntry />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminEntry />
            </RoleRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;