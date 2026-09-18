import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
  ExternalLink,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { useLogoutConfirm } from "../../../context/LogoutContext";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import { resolvePageTitle } from "../../../components/dashboard/pageTitles";

const AdminTopbar = ({ isMenuOpen = false, onMenuToggle = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestLogout } = useLogoutConfirm();
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAdmin();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pageTitle = useMemo(
    () => resolvePageTitle(location.pathname),
    [location.pathname]
  );

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
      if (!e.target.closest("[data-notif]")) setNotifOpen(false);
      if (!e.target.closest("[data-profile]")) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <DashboardHeader title={pageTitle} isMenuOpen={isMenuOpen} onMenuToggle={onMenuToggle}>
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
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[0.55rem] font-bold text-white ring-2 ring-white">
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
              className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl shadow-black/10"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadNotificationCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/admin/notifications");
                      setNotifOpen(false);
                    }}
                    className="text-xs font-medium text-gray-400 hover:text-gray-600"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {recentNotifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
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
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-snug text-gray-800">
                            {notif.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                            {notif.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
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
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="hidden max-w-[80px] truncate text-sm font-semibold text-gray-700 sm:block">
            Admin
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
                    navigate("/admin/profile");
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <UserCircle className="h-4 w-4 text-gray-400" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/admin/settings");
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                  Settings
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

export default AdminTopbar;
