import { motion } from "framer-motion";

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-500", textColor: "text-amber-700", bgColor: "bg-amber-50" },
  confirmed: { label: "Confirmed", color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50" },
  preparing: { label: "Preparing", color: "bg-violet-500", textColor: "text-violet-700", bgColor: "bg-violet-50" },
  ready_for_pickup: { label: "Ready for Pickup", color: "bg-teal-500", textColor: "text-teal-700", bgColor: "bg-teal-50" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-indigo-500", textColor: "text-indigo-700", bgColor: "bg-indigo-50" },
  delivered: { label: "Delivered", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50" },
  completed: { label: "Completed", color: "bg-[#155c43]", textColor: "text-emerald-700", bgColor: "bg-emerald-50" },
  cancelled: { label: "Cancelled", color: "bg-rose-500", textColor: "text-rose-700", bgColor: "bg-rose-50" },
};

export default function OrderStatusCard({ orders = [] }) {
  const total = orders.length || 1;

  const counts = {};
  orders.forEach((order) => {
    const s = order.status || "pending";
    counts[s] = (counts[s] || 0) + 1;
  });

  const sortedStatuses = Object.keys(statusConfig).filter((s) => (counts[s] || 0) > 0);
  if (sortedStatuses.length === 0) {
    sortedStatuses.push("pending");
    counts.pending = 0;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      <h3 className="text-lg font-bold mb-5" style={{ color: "#14261f" }}>
        Order Status Breakdown
      </h3>

      <div className="space-y-3">
        {sortedStatuses.map((status, idx) => {
          const config = statusConfig[status];
          const count = counts[status] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="flex items-center gap-3"
            >
              <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold w-[120px] text-center ${config.textColor} ${config.bgColor}`}>
                {config.label}
              </span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full ${config.color}`}
                />
              </div>
              <span className="text-sm font-bold w-10 text-right" style={{ color: "#14261f" }}>
                {count}
              </span>
              <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">Total Orders</span>
        <span className="text-lg font-bold" style={{ color: "#14261f" }}>
          {orders.length}
        </span>
      </div>
    </motion.div>
  );
}
