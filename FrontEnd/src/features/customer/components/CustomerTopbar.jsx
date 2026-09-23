import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLogoutConfirm } from "../../../context/LogoutContext";
import {
  MapPin,
  Bell,
  ShoppingCart,
  User,
  ChevronDown,
  LogOut,
  Package,
  ExternalLink,
} from "lucide-react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import { resolvePageTitle } from "../../../components/dashboard/pageTitles";

const CustomerTopbar = ({ cartCount, onMenuToggle, isMenuOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestLogout } = useLogoutConfirm();
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
  const pageTitle = useMemo(
    () => resolvePageTitle(location.pathname),
    [location.pathname]
  );

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

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-notif]")) setNotifOpen(false);
      if (!e.target.closest("[data-profile]")) setProfileOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <DashboardHeader title={pageTitle} isMenuOpen={isMenuOpen} onMenuToggle={onMenuToggle}>
      <div className="hidden items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1.5 xl:flex">
        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
        <span className="text-xs font-semibold text-gray-700">Srinagar, J&K</span>
      </div>

      <div className="relative" data-notif>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setNotifOpen(!notifOpen);
            setProfileOpen(false);
          }}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-(--color-primary) px-1 text-[0.55rem] font-bold text-white ring-2 ring-white">
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
              className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl shadow-black/10"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
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
                    className={`cursor-pointer border-b border-gray-50 p-4 transition-colors hover:bg-gray-50/50 ${
                      !readNotifications.includes(notif.id) ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          !readNotifications.includes(notif.id) ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      />
                      <div>
                        <p className="text-sm leading-snug text-gray-700">{notif.text}</p>
                        <p className="mt-1 text-xs text-gray-400">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate("/customer/cart")}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600"
      >
        <ShoppingCart className="h-4 w-4" />
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-(--color-primary) px-1 text-[0.55rem] font-bold text-white ring-2 ring-white"
            >
              {cartCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="relative" data-profile>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setProfileOpen(!profileOpen);
            setNotifOpen(false);
          }}
          className="flex items-center gap-2 rounded-lg border border-gray-200/80 bg-white py-1 pl-1 pr-2 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            {profileImage ? (
              <img src={profileImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-3.5 w-3.5" />
            )}
          </div>
          <span className="hidden max-w-[80px] truncate text-sm font-semibold text-gray-700 sm:block">
            {profileName}
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-gray-400 sm:block" />
        </motion.button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl shadow-black/10"
            >
              <div className="p-3">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/customer/profile");
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <User className="h-4 w-4 text-gray-400" />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/customer/orders");
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <Package className="h-4 w-4 text-gray-400" />
                  My Orders
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/customer/addresses");
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Addresses
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/");
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                  View to Site
                </button>
              </div>
              <div className="border-t border-gray-100 p-3">
                <button
                  type="button"
                  onClick={requestLogout}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardHeader>
  );
};

export default CustomerTopbar;
