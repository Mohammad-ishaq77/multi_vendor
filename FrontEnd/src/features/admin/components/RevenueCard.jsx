import { motion } from "framer-motion";

function formatCurrency(amount) {
  if (amount == null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function RevenueCard({ revenue = {} }) {
  const { today, thisWeek, thisMonth, weeklyBreakdown = [] } = revenue;
  const maxVal = Math.max(...weeklyBreakdown.map((d) => d.amount || 0), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      <h3 className="text-lg font-bold mb-5" style={{ color: "#14261f" }}>
        Revenue Overview
      </h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-xl bg-emerald-50">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Today</p>
          <p className="mt-1 text-xl font-bold text-[#155c43]">{formatCurrency(today)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-blue-50">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">This Week</p>
          <p className="mt-1 text-xl font-bold text-blue-700">{formatCurrency(thisWeek)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-violet-50">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">This Month</p>
          <p className="mt-1 text-xl font-bold text-violet-700">{formatCurrency(thisMonth)}</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3" style={{ color: "#14261f" }}>
          Weekly Breakdown
        </p>
        <div className="flex items-end gap-2 h-32">
          {weeklyBreakdown.map((day, idx) => {
            const pct = maxVal > 0 ? (day.amount / maxVal) * 100 : 0;
            return (
              <motion.div
                key={day.label || idx}
                initial={{ height: 0 }}
                whileInView={{ height: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] font-semibold text-gray-500">
                  {formatCurrency(day.amount)}
                </span>
                <div className="w-full rounded-t-md bg-gradient-to-t from-[#155c43] to-emerald-400 min-h-[4px]" />
                <span className="text-[10px] text-gray-400 font-medium">{day.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
