import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { IndianRupee, Clock, User, ChevronRight, MapPin, XCircle } from "lucide-react";
import { orderStatusConfig, paymentStatusConfig } from "../data/dummyOrders";

const OrderCard = ({ order, index = 0, onStatusUpdate, nextStatus, isUpdating = false }) => {
  const navigate = useNavigate();
  const statusCfg = orderStatusConfig[order.status] || orderStatusConfig.New;
  const paymentStatusLabel = order.paymentStatusLabel || "Pending";
  const paymentCfg = paymentStatusConfig[paymentStatusLabel] || paymentStatusConfig.Pending;
  const showPaymentStatus = order.status !== "Completed" || paymentStatusLabel !== "Pending";
  const canCancel = ["New", "Accepted", "Preparing"].includes(order.status);

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
      className="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200/80 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm">{order.id}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {order.status}
              </span>
              {showPaymentStatus && (
                <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${paymentCfg.bg} ${paymentCfg.color}`}>
                  {paymentStatusLabel}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{order.customer || "Customer"}</span>
              {order.phone && <span>{order.phone}</span>}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo}</span>
              <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{Number(order.total || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:pl-4">
          {nextStatus && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={isUpdating}
              onClick={(e) => { e.stopPropagation(); onStatusUpdate?.(order.id, nextStatus); }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20 disabled:cursor-wait disabled:opacity-60"
            >
              {isUpdating ? "Updating…" : `Mark as ${nextStatus}`}
            </motion.button>
          )}
          {canCancel && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={(event) => {
                event.stopPropagation();
                if (window.confirm(`Cancel order ${order.id}?`)) {
                  onStatusUpdate?.(order.id, "Cancelled");
                }
              }}
              className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}
          <button
            type="button"
            aria-label={`View order ${order.id}`}
            onClick={() => navigate(`/shopkeeper/orders/${order.id}`)}
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {order.deliveryAddress && (
        <p className="mt-3 flex items-start gap-1.5 border-t border-gray-50 pt-3 text-xs text-gray-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="line-clamp-2">{order.deliveryAddress}</span>
        </p>
      )}

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
