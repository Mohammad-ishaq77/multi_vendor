import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { IndianRupee, Clock, User, ChevronRight } from "lucide-react";
import { orderStatusConfig, paymentStatusConfig } from "../data/dummyOrders";

const OrderCard = ({ order, index = 0, onStatusUpdate, nextStatus }) => {
  const navigate = useNavigate();
  const statusCfg = orderStatusConfig[order.status] || orderStatusConfig.New;
  const paymentCfg = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.Paid;

  const timeAgo = (() => {
    if (!order.createdAt) return "";
    const diff = Date.now() - new Date(order.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.05, 0.2) }}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200/80 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm">{order.id}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {order.status}
              </span>
              <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${paymentCfg.bg} ${paymentCfg.color}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{order.customer}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo}</span>
              <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{order.total}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:pl-4">
          {nextStatus && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onStatusUpdate?.(order.id, nextStatus); }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20"
            >
              Move to {nextStatus}
            </motion.button>
          )}
          <button
            onClick={() => navigate(`/shopkeeper/orders/${order.id}`)}
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items preview */}
      {order.items?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2 overflow-x-auto scrollbar-hide">
          {order.items.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5 shrink-0 border border-gray-100">
              <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate">{item.name}</span>
              <span className="text-xs text-gray-400">x{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="flex items-center px-2 text-xs text-gray-400 font-medium">+{order.items.length - 4} more</div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default OrderCard;
