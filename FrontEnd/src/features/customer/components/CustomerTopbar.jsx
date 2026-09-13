import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Bell,
  ShoppingCart,
  User,
  AlignJustify,
  X,
  ChevronDown,
  LogOut,
  Package,
} from "lucide-react";

const CustomerTopbar = ({ cartCount, onMenuToggle, isMenuOpen = false }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() =>
    JSON.parse(localStorage.getItem("nearmart_read_notifications") || "[]")
  );
  const [profileImage, setProfileImage] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearmart_profile") || "{}").image || null;
    } catch {
      return null;
    }
  });
  const [profileName, setProfileName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearmart_profile") || "{}").name || "User";
    } catch {
      return "User";
    }
  });

  useEffect(() => {
    const updateProfile = () => {
      try {
        const p = JSON.parse(localStorage.getItem("nearmart_profile") || "{}");
        setProfileImage(p.image || null);
        setProfileName(p.name || "User");
      } catch {
        setProfileImage(null);
        setProfileName("User");
      }
    };
    window.addEventListener("nearmart-profile-change", updateProfile);
    return () => window.removeEventListener("nearmart-profile-change", updateProfile);
  }, []);

  const search = (event) => {
    event.preventDefault();
    if (query.trim()) {
      navigate(`/customer/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const notifications = [
    { id: 1, text: "Your order #1234 has been shipped!", time: "2m ago", unread: true },
    { id: 2, text: "Fresh Basket added new products", time: "1h ago", unread: true },
    { id: 3, text: "Summer Sale is now live!", time: "3h ago", unread: false },
  ];
  const unreadCount = notifications.filter((n) => !readNotifications.includes(n.id)).length;

  const markAllRead = () => {
    const ids = notifications.map((n) => n.id);
    setReadNotifications(ids);
    localStorage.setItem("nearmart_read_notifications", JSON.stringify(ids));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-notif]")) setNotifOpen(false);
      if (!e.target.closest("[data-profile]")) setProfileOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
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
        </h1>
      </div>

      {/* Search Bar */}
      <motion.form
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={search}
        className="hidden md:flex flex-1 max-w-xl"
      >
        <div
          className={`w-full flex items-center bg-white border rounded-2xl transition-all duration-200 ${
            searchFocused
              ? "border-emerald-400 ring-4 ring-emerald-50 shadow-lg shadow-emerald-900/5"
              : "border-gray-200 shadow-sm hover:border-gray-300"
          }`}
        >
          <div className="pl-4 pr-2 text-gray-400">
            <Search className="w-[1.1rem] h-[1.1rem]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search products, shops, categories..."
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
          <button
            type="submit"
            className="mr-1.5 bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Search
          </button>
        </div>
      </motion.form>

      {/* Right Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Location (desktop) */}
        <motion.div
          whileHover={{ y: -1 }}
          className="hidden xl:flex items-center gap-2 bg-white border border-gray-200/80 px-3.5 py-2 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="leading-tight">
            <p className="text-[0.6rem] text-gray-400 uppercase tracking-wider font-medium">Deliver to</p>
            <p className="text-xs font-semibold text-gray-700">Srinagar, J&K</p>
          </div>
        </motion.div>

        {/* Notifications */}
        <div className="relative" data-notif>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative w-10 h-10 bg-white border border-gray-200/80 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all shadow-sm"
          >
            <Bell className="w-[1.05rem] h-[1.05rem]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] bg-rose-500 text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
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
                  <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-emerald-600 font-semibold hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        const next = [...new Set([...readNotifications, notif.id])];
                        setReadNotifications(next);
                        localStorage.setItem("nearmart_read_notifications", JSON.stringify(next));
                      }}
                      className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50/50 transition-colors ${
                        !readNotifications.includes(notif.id) ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!readNotifications.includes(notif.id) ? "bg-emerald-500" : "bg-gray-300"}`} />
                        <div>
                          <p className="text-sm text-gray-700 leading-snug">{notif.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cart */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate("/customer/cart")}
          className="relative w-10 h-10 bg-white border border-gray-200/80 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all shadow-sm"
        >
          <ShoppingCart className="w-[1.05rem] h-[1.05rem]" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Profile */}
        <div className="relative" data-profile>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 bg-white border border-gray-200/80 rounded-xl pl-1 pr-2.5 py-1 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[80px] truncate">{profileName}</span>
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
                    onClick={() => { navigate("/customer/profile"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </button>
                  <button
                    onClick={() => { navigate("/customer/orders"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Package className="w-4 h-4 text-gray-400" />
                    My Orders
                  </button>
                  <button
                    onClick={() => { navigate("/customer/addresses"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Addresses
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

export default CustomerTopbar;