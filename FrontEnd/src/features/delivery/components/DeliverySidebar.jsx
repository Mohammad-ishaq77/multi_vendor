import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  IndianRupee,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Truck,
  CircleUser,
} from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import DashboardNavFooter, { DashboardMobileFooter } from "../../../components/dashboard/DashboardNavFooter";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/delivery/dashboard", accent: "from-emerald-500 to-teal-500", accentBg: "bg-emerald-50", accentText: "text-emerald-600" },
  { name: "Available", icon: Package, path: "/delivery/available", accent: "from-emerald-600 to-emerald-500", accentBg: "bg-emerald-50", accentText: "text-emerald-600", badge: true },
  { name: "Active", icon: Truck, path: "/delivery/active", accent: "from-teal-600 to-emerald-500", accentBg: "bg-teal-50", accentText: "text-teal-700" },
  { name: "History", icon: ClipboardList, path: "/delivery/history", accent: "from-emerald-700 to-emerald-500", accentBg: "bg-emerald-50", accentText: "text-emerald-700" },
  { name: "Earnings", icon: IndianRupee, path: "/delivery/earnings", accent: "from-teal-500 to-emerald-500", accentBg: "bg-teal-50", accentText: "text-teal-600" },
  { name: "Notifications", icon: Bell, path: "/delivery/notifications", accent: "from-emerald-500 to-green-500", accentBg: "bg-emerald-50", accentText: "text-emerald-600" },
  { name: "Profile", icon: CircleUser, path: "/delivery/profile", accent: "from-emerald-800 to-emerald-600", accentBg: "bg-emerald-50", accentText: "text-emerald-700" },
];

const sidebarVariants = {
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: 0.1 + i * 0.05,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function DeliverySidebar({ isMobileOpen = false, onMobileClose = () => {} }) {
  const location = useLocation();
  const { isOnline, unreadCount, availableDeliveries } = useDeliveryPartner();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const availableCount = availableDeliveries.length;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className={`hidden lg:flex flex-col bg-white border-r border-gray-100/80 h-screen sticky top-0 transition-all duration-300 ${
          isCollapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 py-5 ${isCollapsed ? "justify-center" : ""}`}>
          <motion.div
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center"
          >
            <img src="/logo/logo.png" alt="NearMart" className="h-10 w-10 object-contain" />
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-[1.15rem] font-bold tracking-tight text-gray-900">
                  Near<span className="text-emerald-600">Mart</span>
                </h1>
                <p className="text-[0.6rem] text-gray-400 font-medium -mt-0.5">Delivery Partner</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`ml-auto text-gray-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50 p-1 ${isCollapsed ? "hidden" : "block"}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Collapsed toggle */}
        <AnimatePresence>
          {isCollapsed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsCollapsed(false)}
              className="absolute -right-3 top-[72px] w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-emerald-600 shadow-sm hover:shadow-md transition-all z-10"
            >
              <ChevronRight className="w-3 h-3" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Online Status */}
        {!isCollapsed && (
          <div className="px-5 pb-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
              isOnline ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"
            }`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-hide">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/delivery/dashboard" && location.pathname.startsWith(item.path));
            const isHovered = hoveredItem === item.name;

            return (
              <motion.div
                key={item.name}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <NavLink
                  to={item.path}
                  onClick={onMobileClose}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative block"
                >
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-50/80"
                        : "hover:bg-gray-50/80"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    {/* Left Accent Bar */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="dpSidebarAccent"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          exit={{ scaleY: 0 }}
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-full"
                        />
                      )}
                    </AnimatePresence>

                    {/* Icon Container */}
                    <motion.div
                      animate={{ scale: isActive ? 1.05 : 1 }}
                      className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-[11px] flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-br ${item.accent} text-white shadow-md`
                          : isHovered
                          ? `${item.accentBg} ${item.accentText}`
                          : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 2} />
                    </motion.div>

                    {/* Label */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className={`relative z-10 font-semibold text-[0.82rem] whitespace-nowrap overflow-hidden transition-colors ${
                            isActive
                              ? "text-emerald-700"
                              : isHovered
                              ? "text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Badges */}
                    {!isCollapsed && item.badge && availableCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative z-10 ml-auto bg-[var(--color-primary)] text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm"
                      >
                        {availableCount}
                      </motion.span>
                    )}
                    {!isCollapsed && item.name === "Notifications" && unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative z-10 ml-auto bg-emerald-600 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </motion.div>
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 space-y-0.5 border-t border-gray-100/80">
          {/* Help */}
          <motion.button
            whileHover={{ x: isCollapsed ? 0 : 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open("mailto:support@nearmart.example?subject=NearMart%20Support", "_blank")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isCollapsed ? "justify-center" : ""
            } text-gray-400 hover:bg-gray-50/80 hover:text-gray-600`}
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-[11px] flex items-center justify-center bg-gray-50 text-gray-400">
              <HelpCircle className="w-[18px] h-[18px]" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-[0.82rem] font-semibold whitespace-nowrap overflow-hidden"
                >
                  Help & Support
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <DashboardNavFooter isCollapsed={isCollapsed} />
        </div>
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm lg:hidden"
              aria-label="Close navigation"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-[60] flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div className="flex items-center gap-2.5">
                  <img src="/logo/logo.png" alt="NearMart" className="h-9 w-9 object-contain" />
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">
                      Near<span className="text-emerald-600">Mart</span>
                    </h1>
                    <p className="text-[0.6rem] text-gray-400 font-medium -mt-0.5">Delivery Partner</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
                  aria-label="Close navigation"
                >
                  <ChevronLeft className="h-5 w-5 rotate-180" />
                </button>
              </div>

              <div className="px-5 py-3 border-b border-gray-100">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                  isOnline ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                  {isOnline ? "Online — Ready for deliveries" : "Offline — Not receiving deliveries"}
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div
                            className={`w-9 h-9 rounded-[11px] flex items-center justify-center transition-all ${
                              isActive
                                ? `bg-gradient-to-br ${item.accent} text-white shadow-md`
                                : "bg-gray-50 text-gray-400"
                            }`}
                          >
                            <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 2} />
                          </div>
                          <span>{item.name}</span>
                          {item.badge && availableCount > 0 && (
                            <span className="ml-auto rounded-full bg-[var(--color-primary)] px-1.5 py-0.5 text-[0.6rem] font-bold text-white">
                              {availableCount}
                            </span>
                          )}
                          {item.name === "Notifications" && unreadCount > 0 && (
                            <span className="ml-auto rounded-full bg-emerald-600 px-1.5 py-0.5 text-[0.6rem] font-bold text-white">
                              {unreadCount}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => window.open("mailto:support@nearmart.example?subject=NearMart%20Support", "_blank")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors mx-3 mt-3"
                  style={{ width: "calc(100% - 1.5rem)" }}
                >
                  <div className="w-9 h-9 rounded-[11px] flex items-center justify-center bg-gray-50 text-gray-400">
                    <HelpCircle className="w-[18px] h-[18px]" />
                  </div>
                  Help & Support
                </button>
                <DashboardMobileFooter />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/80 z-50 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/delivery/dashboard" && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center gap-1 p-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="dpMobileNav"
                    className="absolute -top-2 w-8 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-b-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={`w-10 h-10 rounded-[11px] flex items-center justify-center transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${item.accent} text-white shadow-md`
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 2} />
                </motion.div>
                <span className={`text-[0.65rem] font-semibold ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                  {item.name.split(" ")[0]}
                </span>
                {item.badge && availableCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-primary)] text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {availableCount}
                  </span>
                )}
                {item.name === "Notifications" && unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
