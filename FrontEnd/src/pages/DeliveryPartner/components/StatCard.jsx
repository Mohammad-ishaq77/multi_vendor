import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, accent = "emerald" }) {
  const colors = {
    emerald: "from-emerald-500 to-teal-500 shadow-emerald-200",
    blue: "from-blue-500 to-indigo-500 shadow-blue-200",
    amber: "from-amber-500 to-orange-500 shadow-amber-200",
    violet: "from-violet-500 to-purple-500 shadow-violet-200",
    rose: "from-rose-500 to-pink-500 shadow-rose-200",
  };

  return (
    <motion.div whileHover={{ y: -2, scale: 1.01 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[accent]} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
