import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import LandingPage from "../LandingPage/LandingPage";
import About from "../LandingPage/About";
import Contact from "../LandingPage/Contact";

import Login from "../pages/Login";
import Register from "../pages/Register";

import CustomerDashboard from "../pages/Customer/CustomerDashboard";
import Cart from "../pages/Customer/cart/Cart";
import Shops from "../pages/Customer/shops/Shops";
import ShopDetails from "../pages/Customer/shops/ShopDetails";
import Products from "../pages/Customer/products/Products";
import ProductDetail from "../pages/Customer/products/ProductDetail";
import Categories from "../pages/Customer/categories/Categories";
import Checkout from "../pages/Customer/checkout/Checkout";
import Orders from "../pages/Customer/orders/Orders";
import OrderDetails from "../pages/Customer/orders/OrderDetails";
import TrackOrder from "../pages/Customer/orders/TrackOrder";
import Wishlist from "../pages/Customer/wishlist/Wishlist";
import Addresses from "../pages/Customer/addresses/Addresses";
import Profile from "../pages/Customer/profile/Profile";

/* ================= SHOPKEEPER ================= */
import ShopkeeperEntry from "../pages/Shopkeeper/ShopkeeperEntry";
import ShopkeeperDashboard from "../pages/Shopkeeper/ShopkeeperDashboard";

// Onboarding
import ShopTypeSelection from "../pages/Shopkeeper/onboarding/ShopTypeSelection";
import CreateShop from "../pages/Shopkeeper/onboarding/CreateShop";
import ShopDocuments from "../pages/Shopkeeper/onboarding/ShopDocuments";
import ShopApproval from "../pages/Shopkeeper/onboarding/ShopApproval";

// Shop
import MyShop from "../pages/Shopkeeper/shop/MyShop";
import EditShop from "../pages/Shopkeeper/shop/EditShop";
import ShopSettings from "../pages/Shopkeeper/shop/ShopSettings";

// Products
import ShopProducts from "../pages/Shopkeeper/products/Products";
import AddProduct from "../pages/Shopkeeper/products/AddProduct";
import EditProduct from "../pages/Shopkeeper/products/EditProduct";
import ProductDetails from "../pages/Shopkeeper/products/ProductDetails";

// Orders
import ShopOrders from "../pages/Shopkeeper/orders/Orders";
import ShopOrderDetails from "../pages/Shopkeeper/orders/OrderDetails";
import ReadyForPickup from "../pages/Shopkeeper/orders/ReadyForPickup";

// Offers
import ShopOffers from "../pages/Shopkeeper/offers/Offers";
import CreateOffer from "../pages/Shopkeeper/offers/CreateOffer";

// Earnings
import Earnings from "../pages/Shopkeeper/earnings/Earnings";

// Reviews
import Reviews from "../pages/Shopkeeper/reviews/Reviews";

// Profile
import ShopkeeperProfile from "../pages/Shopkeeper/profile/ShopkeeperProfile";

/* ================= DELIVERY PARTNER ================= */
import DeliveryPartnerEntry from "../pages/DeliveryPartner/DeliveryPartnerEntry";

function DeliveryPartnerCompatibilityRedirect() {
  const location = useLocation();
  const canonicalPath = location.pathname.replace(/^\/deliverypartner/, "/delivery");
  return <Navigate to={`${canonicalPath}${location.search}${location.hash}`} replace />;
}

const AppRoutes = () => {
  return (
    <Routes>

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Landing Page Sections */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= CUSTOMER ================= */}

      {/* Customer Dashboard */}
      <Route
        path="/customer/dashboard"
        element={<CustomerDashboard />}
      />

      {/* Customer Cart */}
      <Route
        path="/customer/cart"
        element={<Cart />}
      />

      <Route path="/customer/shops" element={<Shops />} />
      <Route path="/customer/shops/:shopId" element={<ShopDetails />} />
      <Route path="/customer/products" element={<Products />} />
      <Route path="/customer/product/:id" element={<ProductDetail />} />
      <Route path="/customer/categories" element={<Categories />} />
      <Route path="/customer/checkout" element={<Checkout />} />
      <Route path="/customer/orders" element={<Orders />} />
      <Route path="/customer/orders/:orderId" element={<OrderDetails />} />
      <Route path="/customer/orders/:orderId/track" element={<TrackOrder />} />
      <Route path="/customer/wishlist" element={<Wishlist />} />
      <Route path="/customer/addresses" element={<Addresses />} />
      <Route path="/customer/profile" element={<Profile />} />

      {/* ================= SHOPKEEPER ================= */}

      {/* Shopkeeper Wrapper - handles onboarding gate */}
      <Route path="/shopkeeper/*" element={
        <ShopkeeperEntry>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<ShopkeeperDashboard />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<ShopkeeperDashboard />} />

            {/* Onboarding */}
            <Route path="onboarding" element={<ShopTypeSelection />} />
            <Route path="onboarding/create-shop" element={<CreateShop />} />
            <Route path="onboarding/documents" element={<ShopDocuments />} />
            <Route path="onboarding/approval" element={<ShopApproval />} />

            {/* Shop Management */}
            <Route path="shop" element={<MyShop />} />
            <Route path="shop/edit" element={<EditShop />} />
            <Route path="settings" element={<ShopSettings />} />

            {/* Products */}
            <Route path="products" element={<ShopProducts />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="products/:id/edit" element={<EditProduct />} />

            {/* Orders */}
            <Route path="orders" element={<ShopOrders />} />
            <Route path="orders/:orderId" element={<ShopOrderDetails />} />
            <Route path="ready-for-pickup" element={<ReadyForPickup />} />

            {/* Offers */}
            <Route path="offers" element={<ShopOffers />} />
            <Route path="offers/create" element={<CreateOffer />} />

            {/* Earnings */}
            <Route path="earnings" element={<Earnings />} />

            {/* Reviews */}
            <Route path="reviews" element={<Reviews />} />

            {/* Profile */}
            <Route path="profile" element={<ShopkeeperProfile />} />
          </Routes>
        </ShopkeeperEntry>
      } />

      {/* ================= DELIVERY PARTNER ================= */}
      <Route path="/delivery/*" element={<DeliveryPartnerEntry />} />
      <Route path="/deliverypartner/*" element={<DeliveryPartnerCompatibilityRedirect />} />

    </Routes>
  );
};

export default AppRoutes;
