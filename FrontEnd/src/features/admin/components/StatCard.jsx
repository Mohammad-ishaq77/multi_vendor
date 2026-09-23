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
    bg: "bg-(--color-green-bg)",
    text: "text-(--color-primary)",
    gradient: "from-[#059669] to-[#10B981]",
  },
  violet: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    gradient: "from-[#047857] to-[#059669]",
  },
  rose: {
    bg: "bg-(--color-green-soft)",
    text: "text-(--color-primary-dark)",
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
      className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 p-2 sm:rounded-lg sm:p-6"
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-medium text-gray-500 uppercase tracking-wider leading-tight sm:text-xs">{label}</p>
          <p className="mt-0.5 text-sm font-bold leading-tight sm:mt-2 sm:text-2xl" style={{ color: "#14261f" }}>
            {value}
          </p>
          {trend && (
            <div className="mt-0.5 flex items-center gap-0.5 sm:mt-2 sm:gap-1">
              <span
                className={`text-[8px] font-semibold sm:text-xs ${
                  trend.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trend}
              </span>
              <span className="text-[8px] text-gray-400 hidden sm:inline sm:text-xs">vs last week</span>
            </div>
          )}
        </div>
        <div
          className={`h-6 w-6 rounded-md bg-gradient-to-br ${colors.gradient} flex items-center justify-center shrink-0 sm:h-12 sm:w-12 sm:rounded-md`}
        >
          <span className="text-white text-xs sm:text-xl [&_svg]:w-3 [&_svg]:h-3 sm:[&_svg]:w-5 sm:[&_svg]:h-5">{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}
