import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  User,
  ChevronDown,
  LogOut,
  Truck,
  ExternalLink,
} from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useLogoutConfirm } from "../../../context/LogoutContext";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import { resolvePageTitle } from "../../../components/dashboard/pageTitles";

export default function DeliveryTopbar({ onMenuToggle, isMenuOpen = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    profile,
    isOnline,
  } = useDeliveryPartner();
  const { requestLogout } = useLogoutConfirm();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pageTitle = useMemo(
    () => resolvePageTitle(location.pathname),
    [location.pathname]
  );

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
      <div
        className={`hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold sm:flex ${
          isOnline
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-gray-200 bg-gray-50 text-gray-500"
        }`}
      >
        <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
        {isOnline ? "Online" : "Offline"}
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
            <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[0.55rem] font-bold text-white ring-2 ring-white">
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
                    onClick={markAllNotificationsRead}
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
                    onClick={() => markNotificationRead(notif.id)}
                    className={`cursor-pointer border-b border-gray-50 p-4 transition-colors hover:bg-gray-50/50 ${
                      !notif.read ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          !notif.read ? "bg-emerald-500" : "bg-gray-300"
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
              <div className="border-t border-gray-100 p-3">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/delivery/notifications");
                    setNotifOpen(false);
                  }}
                  className="w-full text-center text-xs font-semibold text-emerald-600 hover:underline"
                >
                  View all notifications
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-3.5 w-3.5" />
            )}
          </div>
          <span className="hidden max-w-[80px] truncate text-sm font-semibold text-gray-700 sm:block">
            {profile?.name || "Partner"}
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
                    navigate("/delivery/profile");
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
                    navigate("/delivery/earnings");
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <Truck className="h-4 w-4 text-gray-400" />
                  Earnings
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
}
