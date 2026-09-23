import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, label, value, trend, trendUp = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="h-full rounded-[16px] border border-(--color-green-soft) bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-hover)]"
    >
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-(--color-primary) to-(--color-green-light) text-white shadow-md shadow-(--color-primary)/20">
            <Icon className="h-5 w-5" />
          </div>
        )}
        {trend !== undefined && (
          <span className="rounded-full bg-(--color-green-bg) px-2 py-0.5 text-xs font-bold text-(--color-primary)">
            {trendUp ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-(--color-text)">{value}</p>
      <p className="mt-1 text-xs font-medium text-(--color-text-muted)">{label}</p>
    </motion.div>
  );
};

export default StatCard;
