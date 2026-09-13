import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color = "emerald" }) => {
  const colorMap = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "from-emerald-500 to-teal-500" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "from-blue-500 to-indigo-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", iconBg: "from-amber-500 to-orange-500" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", iconBg: "from-violet-500 to-purple-500" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", iconBg: "from-rose-500 to-pink-500" },
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600", iconBg: "from-cyan-500 to-blue-500" },
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
