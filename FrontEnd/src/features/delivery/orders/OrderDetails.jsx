import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, Store, User, Clock, IndianRupee } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { deliveryHistory } = useDeliveryPartner();

  const order = deliveryHistory.find((d) => d.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-gray-500">Order not found</p>
        <button onClick={() => navigate("/delivery/history")} className="mt-4 text-sm text-emerald-600 font-semibold hover:underline">Back to History</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <button onClick={() => navigate("/delivery/history")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to History
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{order.id}</h1>
            <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${order.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
              {order.status}
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">₹{order.partnerEarning}</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Route */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="flex-1 border-l-2 border-dashed border-gray-300 ml-1">
                <p className="text-xs text-gray-400 pl-3">{order.distance} km · {order.estimatedTime}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-rose-500" />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-emerald-600 font-medium">{order.shopName}</span>
              <span className="text-rose-600 font-medium">{order.customerName}</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Shop</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700"><Store className="w-4 h-4 text-gray-400" /><span className="font-medium">{order.shopName}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /><span>{order.shopAddress}</span></div>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Customer</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">{order.customerName}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /><span>{order.customerAddress}</span></div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Items</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name} × {item.quantity}</span>
                  <span className="text-gray-500">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Order Total</span><span className="font-medium">₹{order.orderAmount}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery Fee</span><span className="font-medium">₹{order.deliveryFee}</span></div>
                <div className="flex justify-between text-sm"><span className="text-emerald-600 font-semibold">Your Earning</span><span className="font-bold text-emerald-600">₹{order.partnerEarning}</span></div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <MapPin className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{order.distance} km</p>
              <p className="text-[0.6rem] text-gray-400">Distance</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{order.estimatedTime}</p>
              <p className="text-[0.6rem] text-gray-400">Est. Time</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <IndianRupee className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">₹{order.deliveryFee}</p>
              <p className="text-[0.6rem] text-gray-400">Fee</p>
            </div>
          </div>

          {order.completedAt && (
            <p className="text-xs text-gray-400 text-center">Completed on {new Date(order.completedAt).toLocaleString()}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
