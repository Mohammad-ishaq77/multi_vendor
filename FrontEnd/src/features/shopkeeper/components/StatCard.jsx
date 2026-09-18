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
      className="bg-white rounded-lg border border-gray-100 p-2 shadow-sm hover:shadow-md transition-all sm:rounded-lg sm:p-5"
    >
      <div className="flex items-start justify-between gap-1">
        <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${c.iconBg} flex items-center justify-center text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-md sm:shadow-md`}>
          <Icon className="h-3 w-3 sm:h-5 sm:w-5" strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <span className={`text-[8px] font-bold px-1 py-0.5 rounded-full sm:text-xs sm:px-2 ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {trendUp ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className="mt-1 sm:mt-4">
        <p className="text-sm font-bold text-gray-900 tracking-tight leading-tight sm:text-2xl">{value}</p>
        <p className="text-[8px] text-gray-500 font-medium mt-0.5 leading-tight sm:text-xs">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
