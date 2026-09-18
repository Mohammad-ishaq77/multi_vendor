import { Routes, Route } from "react-router-dom";

import LandingPage from "../../LandingPage/LandingPage";
import About from "../../LandingPage/About";
import Contact from "../../LandingPage/Contact";
import CategoriesPage from "../../pages/categories/CategoriesPage";
import MarketplacePage from "../../pages/marketplace/MarketplacePage";
import MarketplaceCategoryPage from "../../pages/marketplace/MarketplaceCategoryPage";

import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";

import CustomerDashboard from "../../features/customer/pages/Dashboard";
import Cart from "../../features/customer/cart/Cart";
import Shops from "../../features/customer/shops/Shops";
import ShopDetails from "../../features/customer/shops/ShopDetails";
import Products from "../../features/customer/products/Products";
import ProductDetail from "../../features/customer/products/ProductDetail";
import Categories from "../../features/customer/categories/Categories";
import Checkout from "../../features/customer/checkout/Checkout";
import CustomerOrders from "../../features/customer/orders/Orders";
import CustomerOrderDetails from "../../features/customer/orders/OrderDetails";
import TrackOrder from "../../features/customer/orders/TrackOrder";
import Wishlist from "../../features/customer/wishlist/Wishlist";
import Addresses from "../../features/customer/addresses/Addresses";
import Profile from "../../features/customer/profile/Profile";
import CustomerPayments from "../../features/customer/payments/Payments";

import ShopkeeperEntry from "../../features/shopkeeper/pages/Entry";
import ShopkeeperDashboard from "../../features/shopkeeper/pages/Dashboard";
import ShopTypeSelection from "../../features/shopkeeper/onboarding/ShopTypeSelection";
import CreateShop from "../../features/shopkeeper/onboarding/CreateShop";
import ShopDocuments from "../../features/shopkeeper/onboarding/ShopDocuments";
import ShopApproval from "../../features/shopkeeper/onboarding/ShopApproval";
import MyShop from "../../features/shopkeeper/shop/MyShop";
import EditShop from "../../features/shopkeeper/shop/EditShop";
import ShopSettings from "../../features/shopkeeper/shop/ShopSettings";
import ShopProducts from "../../features/shopkeeper/products/Products";
import AddProduct from "../../features/shopkeeper/products/AddProduct";
import EditProduct from "../../features/shopkeeper/products/EditProduct";
import ShopProductDetails from "../../features/shopkeeper/products/ProductDetails";
import ShopOrders from "../../features/shopkeeper/orders/Orders";
import ShopOrderDetails from "../../features/shopkeeper/orders/OrderDetails";
import ReadyForPickup from "../../features/shopkeeper/orders/ReadyForPickup";
import ShopOffers from "../../features/shopkeeper/offers/Offers";
import CreateOffer from "../../features/shopkeeper/offers/CreateOffer";
import Earnings from "../../features/shopkeeper/earnings/Earnings";
import Reviews from "../../features/shopkeeper/reviews/Reviews";
import ShopkeeperProfile from "../../features/shopkeeper/profile/ShopkeeperProfile";

import DeliveryPartnerEntry from "../../features/delivery/pages/Entry";
import AdminEntry from "../../features/admin/pages/Entry";
import NotFound from "../../pages/not-found/NotFound";

import GuestRoute from "./GuestRoute";
import RoleRoute from "./RoleRoute";
import { ROLES } from "../../config/roles";

const AppRoutes = () => {
  return (
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
  );
};

export default AppRoutes;
