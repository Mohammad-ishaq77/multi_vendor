import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Truck, CheckCircle2, ArrowRight, QrCode } from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";
import { orderStatusConfig } from "../data/dummyOrders";

const ReadyForPickup = () => {
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useShopkeeper();
  const readyOrders = orders.filter((o) => o.status === "Ready for Pickup");

  return (
    <ShopkeeperShell>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Ready for Pickup</h1>
          <p className="text-xs text-gray-500 mt-0.5">Orders packed and ready for delivery partner pickup</p>
        </div>

        {readyOrders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 sm:py-24">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
              <Truck className="w-11 h-11 text-gray-300" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900">No orders ready</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs text-center">Orders will appear here when you mark them as ready for pickup.</p>
            <button onClick={() => navigate("/shopkeeper/orders")} className="mt-6 text-emerald-600 font-semibold text-sm hover:underline">View All Orders</button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {readyOrders.map((order, i) => {
              const cfg = orderStatusConfig[order.status];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
                        <Truck className="w-6 h-6 text-violet-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{order.id}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> Ready
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{order.customer} &middot; {order.items?.length} items &middot; ₹{order.total}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.deliveryAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:pl-4">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateOrderStatus(order.id, "Picked Up")}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Picked Up
                      </motion.button>
                      <button
                        onClick={() => navigate(`/shopkeeper/orders/${order.id}`)}
                        className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-gray-200"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* QR Code placeholder */}
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Verification Code</p>
                      <p className="text-lg font-bold text-gray-900 tracking-widest font-mono">SK-{order.id.slice(-4)}</p>
                      <p className="text-[0.6rem] text-gray-400">Show this to delivery partner for verification</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </ShopkeeperShell>
  );
};

export default ReadyForPickup;
