import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  User,
  AlignJustify,
  X,
  ChevronDown,
  LogOut,
  Truck,
  MapPin,
} from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function DeliveryTopbar({ onMenuToggle, isMenuOpen = false }) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    profile,
    isOnline,
  } = useDeliveryPartner();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
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

      {/* Desktop Info */}
      <div className="hidden lg:flex items-center gap-3 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-sm">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{profile?.name || "Delivery Partner"}</p>
            <p className="text-[0.6rem] text-gray-400 font-medium">{profile?.vehicleType || "Vehicle"}</p>
          </div>
        </div>
      </div>

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
            <p className="text-[0.6rem] text-gray-400 uppercase tracking-wider font-medium">Zone</p>
            <p className="text-xs font-semibold text-gray-700">Srinagar, J&K</p>
          </div>
        </motion.div>

        {/* Online Status Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${
          isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"
        }`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
          {isOnline ? "Online" : "Offline"}
        </div>

        {/* Notifications */}
        <div className="relative" data-notif>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative w-10 h-10 bg-white border border-gray-200/80 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all shadow-sm"
          >
            <Bell className="w-[1.05rem] h-[1.05rem]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
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
                    <button onClick={markAllNotificationsRead} className="text-xs text-emerald-600 font-semibold hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50/50 transition-colors ${
                        !notif.read ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? "bg-emerald-500" : "bg-gray-300"}`} />
                        <div>
                          <p className="text-sm text-gray-700 leading-snug">{notif.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={() => { navigate("/delivery/notifications"); setNotifOpen(false); }}
                    className="w-full text-center text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" data-profile>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 bg-white border border-gray-200/80 rounded-xl pl-1 pr-2.5 py-1 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white overflow-hidden">
              {profile?.profileImage ? (
                <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[80px] truncate">{profile?.name || "Partner"}</span>
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
                    onClick={() => { navigate("/delivery/profile"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </button>
                  <button
                    onClick={() => { navigate("/delivery/earnings"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Truck className="w-4 h-4 text-gray-400" />
                    Earnings
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
}
