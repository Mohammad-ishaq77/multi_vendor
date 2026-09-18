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
      className="bg-white rounded-md border border-gray-100 shadow-sm sm:rounded-lg"
    >
      <div className="flex items-center justify-between p-2.5 pb-1.5 sm:p-5 sm:pb-3">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <h3 className="text-sm font-bold sm:text-lg" style={{ color: "#14261f" }}>
            {title}
          </h3>
          {count > 0 && (
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold sm:min-w-[24px] sm:h-6 sm:px-2 sm:text-xs ${style.badge}`}
            >
              {count}
            </span>
          )}
        </div>
      </div>

      <div className="px-2.5 pb-1.5 space-y-1.5 sm:px-5 sm:pb-3">
        {displayed.length === 0 && (
          <p className="text-[10px] text-gray-400 text-center py-3 sm:text-sm sm:py-6">No pending approvals</p>
        )}
        {displayed.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`flex items-center justify-between py-2 px-2.5 rounded-lg border ${style.border} bg-gray-50/50 sm:py-3 sm:px-3 sm:rounded-md`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-2 h-2 rounded-full ${style.dot}`} />
              <div>
                <p className="text-xs font-semibold sm:text-sm" style={{ color: "#14261f" }}>
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-400 sm:text-xs">{item.email || item.phone}</p>
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
        <div className="px-3.5 pb-3.5 sm:px-5 sm:pb-5">
          <button
            onClick={handleViewAll}
            className="w-full py-2 rounded-lg bg-[#155c43] text-white text-xs font-semibold hover:bg-[#114a36] transition-colors sm:py-2.5 sm:rounded-md sm:text-sm"
          >
            View All ({count})
          </button>
        </div>
      )}
    </motion.div>
  );
}
