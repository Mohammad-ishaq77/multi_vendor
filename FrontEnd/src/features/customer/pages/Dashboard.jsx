import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

import CustomerShell from "../components/CustomerShell";
import CategoryCard from "../components/CategoryCard";
import ShopCard from "../components/ShopCard";
import ProductCard from "../components/ProductCard";
import PageTransition from "../components/PageTransition";

import { categories, shops, products } from "../data/customerData";
import orderService, { ORDERS_CHANGE_EVENT } from "../../../services/orderService";
import { ClipboardList, Heart, ShoppingCart, Truck } from "lucide-react";

// ─── SHARED NAVIGATION ───
export const NAV_ITEMS = [
  { label: "Dashboard", path: "/customer/dashboard", icon: "LayoutDashboard" },
  { label: "Categories", path: "/customer/categories", icon: "Grid3X3" },
  { label: "Shops", path: "/customer/shops", icon: "Store" },
  { label: "Products", path: "/customer/products", icon: "Package" },
  { label: "Orders", path: "/customer/orders", icon: "ShoppingBag" },
  { label: "Wishlist", path: "/customer/wishlist", icon: "Heart" },
  { label: "Addresses", path: "/customer/addresses", icon: "MapPin" },
];

// ─── HERO SLIDES ───
const HERO_SLIDES = [
  {
    id: 1,
    badge: "Your local marketplace",
    headline: "Everything you need, closer to home.",
    subtext: "Shop from trusted local stores on NearMart. Fresh groceries, fashion, electronics & more.",
    cta: "Explore Shops",
    ctaPath: "/customer/shops",
    accent: "from-[#155c43] via-[#1a6b4e] to-[#0d4a32]",
    badgeColor: "bg-white/10 border-white/10 text-green-100/90",
  },
  {
    id: 2,
    badge: "Special Offers",
    headline: "Great deals from stores near you.",
    subtext: "Discover discounts and exclusive offers from local shops.",
    cta: "Shop Offers",
    ctaPath: "/customer/products",
    accent: "from-[#1a5c3a] via-[#207a4e] to-[#145232]",
    badgeColor: "bg-white/10 border-white/20 text-white",
    extraBadge: "Up to 30% OFF",
  },
  {
    id: 3,
    badge: "Shop Local",
    headline: "Discover trusted stores around you.",
    subtext: "Find groceries, fashion, electronics and more from local sellers.",
    cta: "Explore Nearby Shops",
    ctaPath: "/customer/shops",
    accent: "from-[#155c43] via-[#1e7a5a] to-[#0f4d36]",
    badgeColor: "bg-white/10 border-white/10 text-green-100/90",
  },
  {
    id: 4,
    badge: "Fast Local Delivery",
    headline: "Your order, delivered from nearby.",
    subtext: "Simple, convenient and reliable local delivery.",
    cta: "Start Shopping",
    ctaPath: "/customer/products",
    accent: "from-[#145232] via-[#1a6b4e] to-[#155c43]",
    badgeColor: "bg-white/10 border-white/10 text-green-100/90",
  },
];

// ─── REDUCED MOTION ───
const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
};

// ─── HERO CAROUSEL ───
const HeroCarousel = ({ onNavigate }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const timerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotion) return;
    timerRef.current = setInterval(nextSlide, 3000);
    return () => clearInterval(timerRef.current);
  }, [isPaused, reducedMotion, nextSlide]);

  const goTo = (index) => {
    setCurrent(index);
  };

  const slide = HERO_SLIDES[current];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-6 overflow-hidden rounded-md shadow-lg shadow-[#155c43]/10 sm:mb-10 sm:rounded-lg lg:mb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative bg-gradient-to-br ${slide.accent} text-white p-3 min-h-[150px] flex flex-col justify-center sm:p-8 sm:min-h-[260px] lg:p-10 md:min-h-[280px]`}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/[0.06] sm:h-64 sm:w-64 md:h-80 md:w-80" />
          <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full border border-white/[0.04] sm:h-48 sm:w-48 md:h-64 md:w-64" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={reducedMotion ? {} : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative z-10 flex flex-col gap-3 sm:gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="max-w-xl">
              <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:mb-3 sm:gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-medium tracking-wide uppercase backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-1 sm:text-[10px] md:text-xs ${slide.badgeColor}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                  {slide.badge}
                </span>
                {slide.extraBadge && (
                  <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-[var(--color-primary-dark)] sm:px-2.5 sm:py-1 sm:text-[10px] md:text-xs">
                    {slide.extraBadge}
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold leading-tight sm:text-xl md:text-2xl lg:text-[2rem]">
                {slide.headline}
              </h2>

              <p className="mt-1.5 max-w-md text-[10px] leading-relaxed text-green-100/80 sm:mt-3 sm:text-sm md:text-base">
                {slide.subtext}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(slide.ctaPath)}
              className="relative z-10 inline-flex items-center gap-1 self-start rounded-md bg-white px-3 py-1.5 text-[10px] font-semibold text-[#155c43] shadow-md transition-colors hover:bg-green-50 sm:gap-2 sm:self-center sm:rounded-md sm:px-6 sm:py-3.5 sm:text-sm"
            >
              {slide.cta}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-4">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${idx === current ? "w-5 bg-white sm:w-6" : "w-1.5 bg-white/40 hover:bg-white/60 sm:w-2"}`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// ─── ACTIVE ORDER ───
const ActiveOrder = ({ order }) => {
  if (!order) return null;
  const steps = [
    { label: "Confirmed", done: true },
    { label: "Packed", done: true },
    { label: "On the way", done: order.status === "on_the_way" || order.status === "delivered" },
    { label: "Delivered", done: order.status === "delivered" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 sm:mb-12"
    >
      <div className="rounded-md border border-gray-200 bg-white p-2.5 shadow-sm sm:rounded-lg sm:p-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 sm:mb-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[#155c43] sm:text-xs">Your Order</p>
            <h3 className="mt-0.5 text-xs font-bold text-[#14261f] sm:mt-1 sm:text-lg">
              Order #{order.id} <span className="text-[9px] font-normal text-gray-400 sm:text-sm">• {order.shopName}</span>
            </h3>
          </div>
          <span className="rounded-full bg-[#155c43]/10 px-2 py-0.5 text-[9px] font-semibold text-[#155c43] sm:px-3 sm:py-1 sm:text-xs">
            {order.estimatedTime}
          </span>
        </div>

        <div className="mb-4 flex items-center justify-between sm:mb-5">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[9px] font-bold sm:h-8 sm:w-8 sm:text-xs ${step.done ? "border-[#155c43] bg-[#155c43] text-white" : "border-gray-200 bg-white text-gray-300"}`}>
                  {step.done ? "✓" : idx + 1}
                </div>
                <span className={`mt-0.5 text-[9px] font-medium sm:mt-1 sm:text-xs ${step.done ? "text-[#14261f]" : "text-gray-400"}`}>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`mx-0.5 h-0.5 flex-1 sm:mx-1 ${steps[idx + 1].done ? "bg-[#155c43]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-500 sm:text-sm">
            Estimated arrival: <span className="font-semibold text-[#14261f]">{order.estimatedArrival}</span>
          </p>
          <button
            onClick={() => window.location.assign(`/customer/orders/${order.id}/track`)}
            className="text-xs font-semibold text-[#155c43] hover:underline sm:text-sm"
          >
            Track Order →
          </button>
        </div>
      </div>
    </motion.section>
  );
};

// ─── SECTION HEADER ───
const SectionHeader = ({ title, subtitle, actionLabel, onAction, showCartCount, cartCount }) => (
  <div className="mb-2 flex items-end justify-between sm:mb-5 md:mb-6">
    <div className="min-w-0">
      <h2 className="text-sm font-bold text-[#14261f] sm:text-lg md:text-xl lg:text-2xl">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-xs md:text-sm">{subtitle}</p>}
    </div>
    {showCartCount && cartCount > 0 ? (
      <span className="flex-shrink-0 rounded-full bg-[#155c43]/10 px-2.5 py-1 text-[10px] font-semibold text-[#155c43] sm:px-3 sm:py-1.5 sm:text-xs">
        {cartCount} {cartCount === 1 ? "item" : "items"}
      </span>
    ) : actionLabel ? (
      <button onClick={onAction} className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-[#155c43]/5 px-2.5 py-1.5 text-[10px] font-semibold text-[#155c43] transition-colors hover:bg-[#155c43]/10 sm:px-3 sm:py-2 sm:text-xs md:px-4 md:text-sm">
        {actionLabel}
        <span>→</span>
      </button>
    ) : null}
  </div>
);

// ─── SCROLL TO TOP ───
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[#155c43] text-white shadow-lg shadow-[#155c43]/25 sm:bottom-6 sm:right-6 sm:h-11 sm:w-11"
          aria-label="Scroll to top"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ─── MAIN DASHBOARD ───
const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  const [greeting, setGreeting] = useState("Good morning");
  const reducedMotion = useReducedMotion();
  const [orders, setOrders] = useState(() => orderService.getCustomerOrders());
  const [wishlistCount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]").length;
    } catch {
      return 0;
    }
  });

  const activeOrder = orders.find((order) => !["Delivered", "Cancelled", "Completed"].includes(order.status));

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else if (hour < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  useEffect(() => {
    const refresh = () => setOrders(orderService.getCustomerOrders());
    window.addEventListener(ORDERS_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(ORDERS_CHANGE_EVENT, refresh);
  }, []);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: reducedMotion ? 0 : 0.05, delayChildren: 0.05 } },
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  const mappedActiveOrder = activeOrder
    ? {
        id: activeOrder.id,
        shopName: activeOrder.shopName || activeOrder.items?.[0]?.shopName || "NearMart",
        status: ["Shipped", "Out for Delivery"].includes(activeOrder.status) ? "on_the_way" : activeOrder.status === "Delivered" ? "delivered" : "processing",
        estimatedTime: "Live tracking",
        estimatedArrival: "Soon",
      }
    : null;

  return (
    <CustomerShell>
      <PageTransition>
          {/* Welcome */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="mb-3 sm:mb-6 md:mb-8">
            <h1 className="text-base font-bold leading-tight tracking-tight text-[#14261f] sm:text-[1.6rem] lg:text-[2.25rem]">
              {greeting}
            </h1>
            <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1.5 sm:text-sm lg:text-base">
              Find what you need from trusted stores near you.
            </p>
          </motion.section>

          <div className="mb-3 grid grid-cols-2 gap-1.5 sm:mb-6 sm:gap-3 xl:grid-cols-4">
            {[
              { label: "Orders", value: orders.length, icon: ClipboardList, path: "/customer/orders" },
              { label: "Active tracking", value: activeOrder ? 1 : 0, icon: Truck, path: activeOrder ? `/customer/orders/${activeOrder.id}/track` : "/customer/orders" },
              { label: "Cart", value: cartCount, icon: ShoppingCart, path: "/customer/cart" },
              { label: "Wishlist", value: wishlistCount, icon: Heart, path: "/customer/wishlist" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <button
                  key={stat.label}
                  type="button"
                  onClick={() => navigate(stat.path)}
                  className="rounded-md border border-gray-100 bg-white p-2 text-left shadow-sm transition hover:shadow-md sm:rounded-lg sm:p-4"
                >
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-green-bg)] text-[var(--color-primary)] sm:h-10 sm:w-10 sm:rounded-md">
                      <Icon className="h-3 w-3 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] text-gray-500 sm:text-xs">{stat.label}</p>
                      <p className="text-xs font-bold text-[#14261f] leading-tight sm:text-xl">{stat.value}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <HeroCarousel onNavigate={navigate} />
          <ActiveOrder order={mappedActiveOrder} />

          {/* Categories — horizontal scroll on mobile, grid on desktop */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="mb-6 sm:mb-10 lg:mb-12">
            <SectionHeader title="Shop by Category" subtitle="Find what you need quickly." actionLabel="View all" onAction={() => navigate("/customer/categories")} />
            <motion.div
              variants={staggerContainer}
              className="flex gap-2 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 sm:overflow-visible sm:gap-3 sm:pb-0 sm:pt-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((category) => (
                <motion.div key={category.id} variants={fadeUpItem} className="min-w-[88px] flex-shrink-0 snap-start sm:min-w-0">
                  <CategoryCard category={category} onClick={() => navigate("/customer/categories")} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Shops */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="mb-6 sm:mb-10 lg:mb-12">
            <SectionHeader title="Popular Shops Near You" subtitle="Discover trusted local stores." actionLabel="View all" onAction={() => navigate("/customer/shops")} />
            <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
              {shops.map((shop) => (
                <motion.div key={shop.id} variants={fadeUpItem}>
                  <ShopCard shop={shop} onClick={() => navigate(`/customer/shops/${shop.id}`)} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          
          {/* Popular Products — only 4-5 cards with View More button */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="mb-6 sm:mb-10 lg:mb-12">
            <SectionHeader title="Popular Products" subtitle="Trending items from local shops." actionLabel="View More" onAction={() => navigate("/customer/products")} />
            <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.slice(0, 5).map((product) => (
                <motion.div key={product.id} variants={fadeUpItem}>
                  <ProductCard
                    product={product}
                    onAddToCart={(p) => addToCart(p)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          <div className="h-6 sm:h-8" />
        <ScrollToTop />
      </PageTransition>
    </CustomerShell>
  );
};

export default CustomerDashboard;