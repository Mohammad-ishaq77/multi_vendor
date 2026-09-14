import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color = "emerald" }) => {
  const colorMap = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "from-emerald-500 to-teal-500" },
    blue: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "from-emerald-600 to-emerald-500" },
    amber: { bg: "bg-[var(--color-green-bg)]", text: "text-[var(--color-primary)]", iconBg: "from-emerald-700 to-emerald-500" },
    violet: { bg: "bg-teal-50", text: "text-teal-700", iconBg: "from-teal-600 to-emerald-500" },
    rose: { bg: "bg-[var(--color-green-soft)]", text: "text-[var(--color-primary-dark)]", iconBg: "from-emerald-800 to-emerald-600" },
    cyan: { bg: "bg-teal-50", text: "text-teal-600", iconBg: "from-teal-500 to-emerald-500" },
  };

  const c = colorMap[color] || colorMap.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.iconBg} flex items-center justify-center text-white shadow-md`}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {trendUp ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
