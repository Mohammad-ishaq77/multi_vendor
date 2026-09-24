import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Package, ShoppingCart, CreditCard, AlertTriangle, UserPlus } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const typeIcons = {
  delivery: Package,
  order: ShoppingCart,
  payment: CreditCard,
  system: AlertTriangle,
  approval: UserPlus,
};

const typeColors = {
  delivery: "bg-blue-50 text-blue-600",
  order: "bg-emerald-50 text-emerald-600",
  payment: "bg-amber-50 text-amber-600",
  system: "bg-rose-50 text-rose-600",
  approval: "bg-violet-50 text-violet-600",
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationCount } = useAdmin();
  const [filter, setFilter] = useState("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter !== "all") return n.type === filter;
    return true;
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#14261f]">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">{unreadNotificationCount} unread notification{unreadNotificationCount !== 1 ? "s" : ""}</p>
          </div>
          {unreadNotificationCount > 0 && (
            <button onClick={markAllNotificationsRead} className="flex items-center gap-2 px-4 py-2 bg-[#155c43] text-white text-sm font-semibold rounded-md hover:bg-[#155c43]/90 transition-colors">
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "unread", "delivery", "order", "payment", "system", "approval"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-[#155c43] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#155c43]"}`}>
              {f === "all" ? "All" : f === "unread" ? "Unread" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n) => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <motion.div key={n.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={() => !n.read && markNotificationRead(n.id)} className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${!n.read ? "border-[#155c43]/20 shadow-sm" : "border-gray-100 hover:bg-gray-50/50"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${typeColors[n.type] || "bg-gray-50 text-gray-600"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${!n.read ? "font-semibold text-gray-900" : "text-gray-600"}`}>{n.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-[#155c43] shrink-0 mt-1.5"></div>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-400">No notifications</p>
              <p className="text-xs text-gray-400 mt-1">{filter === "unread" ? "You're all caught up!" : "No notifications match this filter."}</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
