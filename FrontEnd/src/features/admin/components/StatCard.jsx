import { motion } from "framer-motion";

const accents = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    gradient: "from-[#155c43] to-emerald-400",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    gradient: "from-blue-600 to-blue-400",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    gradient: "from-amber-600 to-amber-400",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    gradient: "from-violet-600 to-violet-400",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    gradient: "from-rose-600 to-rose-400",
  },
};

export default function StatCard({ icon, label, value, accent = "emerald", trend, delay = 0 }) {
  const colors = accents[accent] || accents.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: "#14261f" }}>
            {value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-semibold ${
                  trend.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trend}
              </span>
              <span className="text-xs text-gray-400">vs last week</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-white text-xl">{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}
