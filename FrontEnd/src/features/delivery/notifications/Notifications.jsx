import { motion } from "framer-motion";
import { Bell, Package, Truck, IndianRupee, Shield, CheckCheck } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

const iconMap = {
  delivery: Package,
  assignment: Truck,
  pickup: Package,
  earning: IndianRupee,
  system: Shield,
};

export default function Notifications() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useDeliveryPartner();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-100">
          <Bell className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <motion.div
                key={notif.id}
                whileHover={{ y: -1 }}
                onClick={() => markNotificationRead(notif.id)}
                className={`bg-white rounded-md border p-4 cursor-pointer transition-all ${
                  !notif.read ? "border-emerald-200 bg-emerald-50/30 shadow-sm" : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    !notif.read ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.read ? "font-semibold text-gray-900" : "text-gray-600"}`}>{notif.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
