import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const typeStyles = {
  shopkeeper: {
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    route: "/admin/approvals/shopkeepers",
  },
  delivery: {
    badge: "bg-blue-100 text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    route: "/admin/approvals/delivery-partners",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ApprovalCard({ title, count, items = [], onViewAll, type = "shopkeeper" }) {
  const navigate = useNavigate();
  const style = typeStyles[type] || typeStyles.shopkeeper;
  const displayed = items.slice(0, 3);

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate(style.route);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
            {title}
          </h3>
          {count > 0 && (
            <span
              className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold ${style.badge}`}
            >
              {count}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pb-3 space-y-2">
        {displayed.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No pending approvals</p>
        )}
        {displayed.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`flex items-center justify-between py-3 px-3 rounded-xl border ${style.border} bg-gray-50/50`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${style.dot}`} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#14261f" }}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-400">{item.email || item.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${style.badge}`}
              >
                {type === "shopkeeper" ? "Shop" : "Delivery"}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(item.date)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {count > 0 && (
        <div className="px-5 pb-5">
          <button
            onClick={handleViewAll}
            className="w-full py-2.5 rounded-xl bg-[#155c43] text-white text-sm font-semibold hover:bg-[#114a36] transition-colors"
          >
            View All ({count})
          </button>
        </div>
      )}
    </motion.div>
  );
}
