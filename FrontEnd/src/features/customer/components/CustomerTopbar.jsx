import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLogoutConfirm } from "../../../context/LogoutContext";
import { useAuth } from "../../../context/AuthContext";
import { notificationService } from "../../../services/catalogService";
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

const formatNotificationTime = (value) => {
  if (!value) return "just now";

  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const getInitials = (name) => {
  const source = String(name || "").trim();
  if (!source) return "U";

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const CustomerTopbar = ({ cartCount, onMenuToggle, isMenuOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestLogout } = useLogoutConfirm();
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearmart_read_notifications") || "[]");
    } catch {
      return [];
    }
  });

  const profileName = user?.name ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("nearmart_profile") || "{}").name || "User";
      } catch {
        return "User";
      }
    })();

  const profileImage = user?.avatarUrl || user?.image ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("nearmart_profile") || "{}").image || null;
      } catch {
        return null;
      }
    })();

  const profileInitials = getInitials(profileName);

  const pageTitle = useMemo(
    () => resolvePageTitle(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    const updateProfile = () => {
      // The authenticated user object is the source of truth; local profile data only
      // exists as a fallback for the moment before auth resolves.
    };

    window.addEventListener("nearmart-profile-change", updateProfile);
    return () => window.removeEventListener("nearmart-profile-change", updateProfile);
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    let active = true;

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const { items = [] } = await notificationService.list({ limit: 10 });
        if (!active) return;
        setNotifications(items.map((item) => ({
          ...item,
          id: item.id,
          text: item.title || item.message || "New notification",
          message: item.message || "",
          time: formatNotificationTime(item.createdAt),
          read: Boolean(item.isRead || item.read),
          isRead: Boolean(item.isRead || item.read),
        })));
      } catch {
        if (active) setNotifications([]);
      } finally {
        if (active) setNotificationsLoading(false);
      }
    };

    loadNotifications();
    window.addEventListener("focus", loadNotifications);

    return () => {
      active = false;
      window.removeEventListener("focus", loadNotifications);
    };
  }, [user]);

  const notificationList = notifications.map((notif) => ({
    ...notif,
    isRead: notif.isRead || notif.read || readNotifications.includes(notif.id),
    read: notif.isRead || notif.read || readNotifications.includes(notif.id),
  }));

  const unreadCount = notificationList.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    const unreadItems = notificationList.filter((n) => !n.isRead);
    if (!unreadItems.length) return;

    await Promise.allSettled(
      unreadItems.map((notif) => notificationService.markRead(notif.id))
    );

    const ids = Array.from(new Set([...readNotifications, ...unreadItems.map((n) => n.id)]));
    setReadNotifications(ids);
    localStorage.setItem("nearmart_read_notifications", JSON.stringify(ids));
    setNotifications((current) =>
      current.map((notif) =>
        unreadItems.some((item) => item.id === notif.id)
          ? { ...notif, read: true, isRead: true }
          : notif
      )
    );
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
              className="absolute right-0 top-11 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl shadow-black/10"
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
                {notificationsLoading ? (
                  <div className="p-4 text-sm text-gray-500">Loading notifications…</div>
                ) : notificationList.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
                ) : (
                  notificationList.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        const next = [...new Set([...readNotifications, notif.id])];
                        setReadNotifications(next);
                        localStorage.setItem("nearmart_read_notifications", JSON.stringify(next));
                        setNotifications((current) =>
                          current.map((item) =>
                            item.id === notif.id ? { ...item, read: true, isRead: true } : item
                          )
                        );
                      }}
                      className={`cursor-pointer border-b border-gray-50 p-4 transition-colors hover:bg-gray-50/50 ${
                        !notif.isRead ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            !notif.isRead ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                        />
                        <div>
                          <p className="text-sm leading-snug text-gray-700">{notif.text || notif.message || "New notification"}</p>
                          <p className="mt-1 text-xs text-gray-400">{notif.time}</p>
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
              <img src={profileImage} alt={profileName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[0.55rem] font-bold tracking-wide">{profileInitials}</span>
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
