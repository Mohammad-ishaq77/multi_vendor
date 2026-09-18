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
      className="bg-white rounded-md border border-gray-100 shadow-sm p-2.5 sm:rounded-lg sm:p-5"
    >
      <h3 className="text-sm font-bold mb-2 sm:text-lg sm:mb-5" style={{ color: "#14261f" }}>
        Order Status Breakdown
      </h3>

      <div className="space-y-2 sm:space-y-3">
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
              className="flex items-center gap-2 sm:gap-3"
            >
              <span className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-semibold w-[72px] text-center sm:px-2 sm:text-[11px] sm:w-[120px] ${config.textColor} ${config.bgColor}`}>
                {config.label}
              </span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden sm:h-6">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full ${config.color}`}
                />
              </div>
              <span className="text-xs font-bold w-7 text-right sm:text-sm sm:w-10" style={{ color: "#14261f" }}>
                {count}
              </span>
              <span className="text-[10px] text-gray-400 w-8 text-right sm:text-xs sm:w-10">{pct}%</span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between sm:mt-4 sm:pt-4">
        <span className="text-xs text-gray-500 sm:text-sm">Total Orders</span>
        <span className="text-base font-bold sm:text-lg" style={{ color: "#14261f" }}>
          {orders.length}
        </span>
      </div>
    </motion.div>
  );
}
