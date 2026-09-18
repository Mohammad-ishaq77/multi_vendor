import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Package,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";
import { paymentStatusConfig, orderStatusFlow } from "../data/dummyOrders";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, getNextStatus } = useShopkeeper();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <ShopkeeperShell>
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Order not found.</p>
          <button onClick={() => navigate("/shopkeeper/orders")} className="mt-4 text-emerald-600 font-semibold text-sm hover:underline">Back to Orders</button>
        </div>
      </ShopkeeperShell>
    );
  }

  const paymentCfg = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.Paid;
  const nextStatus = getNextStatus(order.status);
  const currentStep = orderStatusFlow.indexOf(order.status);

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
    <ShopkeeperShell>
      <div className="w-full">
        <button onClick={() => navigate("/shopkeeper/orders")} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Order {order.id}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Placed {timeAgo}</p>
          </div>
          {nextStatus && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => updateOrderStatus(order.id, nextStatus)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark as {nextStatus}
            </motion.button>
          )}
        </div>

        {/* Status Progress */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Order Progress</h3>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-2">
            {orderStatusFlow.map((status, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={status} className="flex items-center">
                  <div className={`flex flex-col items-center gap-1.5 min-w-[70px]`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? "bg-emerald-500 text-white" : isCurrent ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : "bg-gray-100 text-gray-400"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-[0.6rem] font-semibold text-center ${isCurrent ? "text-emerald-600" : isCompleted ? "text-emerald-500" : "text-gray-400"}`}>{status}</span>
                  </div>
                  {i < orderStatusFlow.length - 1 && (
                    <div className={`w-6 h-0.5 mx-1 rounded-full ${i < currentStep ? "bg-emerald-500" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Customer Info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> Customer</h3>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">{order.customer}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" />{order.phone}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" />{order.deliveryAddress}</p>
            </div>
          </motion.div>

          {/* Payment Info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-gray-400" /> Payment</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Method</span><span className="font-semibold text-gray-900">{order.paymentMethod}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${paymentCfg.bg} ${paymentCfg.color}`}>{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total</span><span className="font-bold text-gray-900">₹{order.total}</span></div>
            </div>
          </motion.div>
        </div>

        {/* Order Items */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-gray-400" /> Items ({order.items?.length || 0})</h3>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0">
                  {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">₹{item.price} × {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-emerald-600">₹{order.total}</span>
          </div>
        </motion.div>
      </div>
    </ShopkeeperShell>
  );
};

export default OrderDetails;
