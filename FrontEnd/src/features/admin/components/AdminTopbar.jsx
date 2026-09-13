import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  User,
  AlignJustify,
  X,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
  ShoppingBag,
  Users,
  Store,
  Truck,
  Package,
  CreditCard,
  Map,
  Tag,
  ShieldCheck,
  ClipboardCheck,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/users/customers": "Customers",
  "/admin/users/shopkeepers": "Shopkeepers",
  "/admin/users/delivery-partners": "Delivery Partners",
  "/admin/shops": "Shops",
  "/admin/products": "Products",
  "/admin/approvals/shopkeepers": "Shopkeeper Approvals",
  "/admin/approvals/delivery-partners": "Delivery Approvals",
  "/admin/shops/requests": "Shop Type Requests",
  "/admin/orders": "Orders",
  "/admin/deliveries": "Delivery Monitoring",
  "/admin/payments": "Payments",
  "/admin/offers": "Offers",
  "/admin/reports": "Reports",
  "/admin/reports/sales": "Sales Reports",
  "/admin/reports/users": "User Reports",
  "/admin/reports/delivery": "Delivery Reports",
  "/admin/notifications": "Notifications",
  "/admin/profile": "Profile",
  "/admin/settings": "Settings",
};

const SEARCH_ENTITY_ICONS = {
  customer: Users,
  shopkeeper: Store,
  shop: Store,
  order: ShoppingBag,
  delivery_partner: Truck,
  product: Package,
  payment: CreditCard,
  offer: Tag,
  report: BarChart3,
};

const SEARCH_ENTITY_COLORS = {
  customer: "bg-blue-100 text-blue-700",
  shopkeeper: "bg-violet-100 text-violet-700",
  shop: "bg-cyan-100 text-cyan-700",
  order: "bg-rose-100 text-rose-700",
  delivery_partner: "bg-amber-100 text-amber-700",
  product: "bg-teal-100 text-teal-700",
  payment: "bg-green-100 text-green-700",
  offer: "bg-purple-100 text-purple-700",
  report: "bg-sky-100 text-sky-700",
};

const AdminTopbar = ({ isMenuOpen = false, onMenuToggle = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    customers,
    shopkeepers,
    deliveryPartners,
    shops,
    products,
    orders,
  } = useAdmin();

  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef(null);

  const pageTitle = useMemo(() => {
    const exact = PAGE_TITLES[location.pathname];
    if (exact) return exact;
    for (const [path, title] of Object.entries(PAGE_TITLES)) {
      if (location.pathname.startsWith(path + "/")) return title;
    }
    return "Admin";
  }, [location.pathname]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results = [];

    customers.forEach((c) => {
      if (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      ) {
        results.push({ type: "customer", id: c.id, name: c.name, subtitle: c.email, path: "/admin/users/customers" });
      }
    });

    shopkeepers.forEach((s) => {
      if (
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.shopName?.toLowerCase().includes(q)
      ) {
        results.push({ type: "shopkeeper", id: s.id, name: s.name, subtitle: s.shopName || s.email, path: "/admin/users/shopkeepers" });
      }
    });

    shops.forEach((s) => {
      if (
        s.name?.toLowerCase().includes(q) ||
        s.type?.toLowerCase().includes(q) ||
        s.ownerName?.toLowerCase().includes(q)
      ) {
        results.push({ type: "shop", id: s.id, name: s.name, subtitle: s.type, path: "/admin/shops" });
      }
    });

    orders.forEach((o) => {
      if (
        o.id?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.shopName?.toLowerCase().includes(q)
      ) {
        results.push({ type: "order", id: o.id, name: o.id, subtitle: `${o.customerName} — ₹${o.totalAmount}`, path: "/admin/orders" });
      }
    });

    deliveryPartners.forEach((d) => {
      if (
        d.name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.vehicleNumber?.toLowerCase().includes(q)
      ) {
        results.push({ type: "delivery_partner", id: d.id, name: d.name, subtitle: d.vehicleNumber || d.email, path: "/admin/users/delivery-partners" });
      }
    });

    products.forEach((p) => {
      if (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      ) {
        results.push({ type: "product", id: p.id, name: p.name, subtitle: p.category, path: "/admin/products" });
      }
    });

    return results.slice(0, 8);
  }, [query, customers, shopkeepers, shops, orders, deliveryPartners, products]);

  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [notifications]);

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (!e.target.closest("[data-notif]")) setNotifOpen(false);
      if (!e.target.closest("[data-profile]")) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex items-center gap-3 mb-6 sm:mb-8 relative z-[70]">
      {/* Hamburger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={onMenuToggle}
        className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200/80 text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 shadow-sm transition-all"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
      >
        <AnimatePresence mode="wait">
          {isMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <AlignJustify className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Logo */}
      <div className="lg:hidden flex-shrink-0">
        <h1 className="text-lg font-bold tracking-tight text-gray-900">
          Near<span className="text-emerald-600">Mart</span>
          <span className="text-xs font-medium text-gray-400 ml-1">Admin</span>
        </h1>
      </div>

      {/* Desktop Page Title */}
      <motion.h2
        key={pageTitle}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block text-xl font-bold text-gray-900 tracking-tight"
      >
        {pageTitle}
      </motion.h2>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="hidden md:flex flex-1 max-w-xl ml-auto"
        ref={searchRef}
      >
        <div
          className={`w-full relative bg-white border rounded-2xl transition-all duration-200 ${
            searchFocused
              ? "border-emerald-400 ring-4 ring-emerald-50 shadow-lg shadow-emerald-900/5"
              : "border-gray-200 shadow-sm hover:border-gray-300"
          }`}
        >
          <div className="flex items-center">
            <div className="pl-4 pr-2 text-gray-400">
              <Search className="w-[1.1rem] h-[1.1rem]" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search customers, shops, orders..."
              className="flex-1 bg-transparent py-3 px-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            />
            {query && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="button"
                onClick={() => setQuery("")}
                className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchFocused && query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden z-50"
              >
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="p-6 text-center">
                      <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 font-medium">
                        No results found for "{query}"
                      </p>
                    </div>
                  ) : (
                    searchResults.map((result, idx) => {
                      const EntityIcon =
                        SEARCH_ENTITY_ICONS[result.type] || Package;
                      return (
                        <button
                          key={`${result.type}-${result.id}-${idx}`}
                          onClick={() => {
                            navigate(result.path);
                            setQuery("");
                            setSearchFocused(false);
                          }}
                          className="w-full flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-b-0 text-left"
                        >
                          <div
                            className={`w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 ${
                              SEARCH_ENTITY_COLORS[result.type] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <EntityIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {result.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          <span
                            className={`text-[0.6rem] font-bold uppercase px-2 py-1 rounded-full ${
                              SEARCH_ENTITY_COLORS[result.type] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {result.type.replace("_", " ")}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:ml-4">
        {/* Notifications */}
        <div className="relative" data-notif>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative w-10 h-10 bg-white border border-gray-200/80 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all shadow-sm"
          >
            <Bell className="w-[1.05rem] h-[1.05rem]" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                {unreadNotificationCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900">
                    Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-emerald-600 font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigate("/admin/notifications");
                        setNotifOpen(false);
                      }}
                      className="text-xs text-gray-400 font-medium hover:text-gray-600"
                    >
                      View all
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No notifications</p>
                    </div>
                  ) : (
                    recentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.link) {
                            navigate(notif.link);
                            setNotifOpen(false);
                          }
                        }}
                        className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50/50 transition-colors ${
                          !notif.isRead ? "bg-emerald-50/30" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              !notif.isRead ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 leading-snug">
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {timeAgo(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" data-profile>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 bg-white border border-gray-200/80 rounded-xl pl-1 pr-2.5 py-1 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white overflow-hidden">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[80px] truncate">
              Admin
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-3">
                  <button
                    onClick={() => {
                      navigate("/admin/profile");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <UserCircle className="w-4 h-4 text-gray-400" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-gray-100 p-3">
                  <button
                    onClick={() => {
                      localStorage.removeItem("nearmart_session");
                      navigate("/login", { replace: true });
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
