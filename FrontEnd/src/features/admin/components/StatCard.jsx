import { motion } from "framer-motion";

const accents = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    gradient: "from-[#064E3B] to-[#10B981]",
  },
  blue: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    gradient: "from-[#047857] to-[#10B981]",
  },
  amber: {
    bg: "bg-[var(--color-green-bg)]",
    text: "text-[var(--color-primary)]",
    gradient: "from-[#059669] to-[#10B981]",
  },
  violet: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    gradient: "from-[#047857] to-[#059669]",
  },
  rose: {
    bg: "bg-[var(--color-green-soft)]",
    text: "text-[var(--color-primary-dark)]",
    gradient: "from-[#064E3B] to-[#047857]",
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
