import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const activityConfig = {
  shop_registered: {
    icon: "🏪",
    color: "bg-emerald-100 text-emerald-700",
  },
  delivery_application: {
    icon: "📦",
    color: "bg-blue-100 text-blue-700",
  },
  order_completed: {
    icon: "✅",
    color: "bg-green-100 text-green-700",
  },
  payment_received: {
    icon: "💰",
    color: "bg-amber-100 text-amber-700",
  },
  product_added: {
    icon: "🛍️",
    color: "bg-violet-100 text-violet-700",
  },
  shop_suspended: {
    icon: "🚫",
    color: "bg-rose-100 text-rose-700",
  },
  delivery_completed: {
    icon: "🚚",
    color: "bg-blue-100 text-blue-700",
  },
  customer_registered: {
    icon: "👤",
    color: "bg-teal-100 text-teal-700",
  },
};

function formatTime(time) {
  if (!time) return "";
  const d = new Date(time);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export default function ActivityCard({ activities = [] }) {
  const displayed = activities.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-md border border-gray-100 shadow-sm sm:rounded-lg"
    >
      <div className="flex items-center justify-between p-2.5 pb-1.5 sm:p-5 sm:pb-3">
        <h3 className="text-sm font-bold sm:text-lg" style={{ color: "#14261f" }}>
          Recent Activity
        </h3>
        <Link
          to="/admin/reports"
          className="text-[9px] font-semibold text-[#155c43] hover:underline sm:text-xs"
        >
          View All
        </Link>
      </div>

      <div className="px-2.5 pb-2.5 space-y-0.5 sm:px-5 sm:pb-5">
        {displayed.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-5 sm:text-sm sm:py-8">No recent activity</p>
        )}
        {displayed.map((activity, idx) => {
          const config = activityConfig[activity.type] || activityConfig.shop_registered;
          return (
            <motion.div
              key={activity.id || idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0 ${config.color}`}
              >
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{activity.text}</p>
                {activity.meta && (
                  <p className="text-xs text-gray-400 truncate">{activity.meta}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                {formatTime(activity.time)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
