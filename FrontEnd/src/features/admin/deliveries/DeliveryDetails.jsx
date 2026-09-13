import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Truck, Store, User, Package, IndianRupee, Shield, CheckCircle } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusColors = {
  ready_for_pickup: "bg-blue-50 text-blue-700 border-blue-200",
  out_for_delivery: "bg-amber-50 text-amber-700 border-amber-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function DeliveryDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders } = useAdmin();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Delivery not found</h2>
          <p className="text-sm text-gray-500 mt-1">Order {orderId} does not exist.</p>
          <Link to="/admin/deliveries" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#155c43] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Deliveries
          </Link>
        </div>
      </PageTransition>
    );
  }

  const timeline = [
    { label: "Order Placed", done: true, time: order.orderDate },
    { label: "Confirmed", done: ["confirmed", "preparing", "ready_for_pickup", "out_for_delivery", "delivered", "completed"].includes(order.status) },
    { label: "Preparing", done: ["preparing", "ready_for_pickup", "out_for_delivery", "delivered", "completed"].includes(order.status) },
    { label: "Ready for Pickup", done: ["ready_for_pickup", "out_for_delivery", "delivered", "completed"].includes(order.status) },
    { label: "Out for Delivery", done: ["out_for_delivery", "delivered", "completed"].includes(order.status) },
    { label: "Delivered", done: ["delivered", "completed"].includes(order.status) },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/deliveries")} className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#155c43] hover:border-emerald-200 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#14261f]">Delivery {order.id}</h1>
            <p className="text-sm text-gray-500">Delivery monitoring details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Delivery Status</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {order.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
              <div className="space-y-3">
                {timeline.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step.done ? "bg-[#155c43] text-white" : "bg-gray-100 text-gray-400"}`}>
                      {step.done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-sm ${step.done ? "text-gray-900 font-medium" : "text-gray-400"}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Package Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Package Status</h3>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">SEALED</p>
                  <p className="text-xs text-emerald-600">Package is sealed and has not been opened during transit.</p>
                </div>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Fee Breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Fee Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Product Amount</span><span className="font-semibold">₹{order.productAmount}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery Fee ({order.deliveryDistance} km)</span><span className="font-semibold">₹{order.deliveryFee}</span></div>
                <div className="border-t border-gray-100 pt-2 flex justify-between text-sm"><span className="text-gray-500">Total Customer Payment</span><span className="font-bold text-[#155c43]">₹{order.totalAmount}</span></div>
                <div className="border-t border-gray-100 pt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Revenue Split</p>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">→ Shopkeeper</span><span className="font-semibold">₹{order.productAmount}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">→ Delivery Partner (80%)</span><span className="font-semibold">₹{order.partnerShare}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">→ NearMart (20%)</span><span className="font-semibold">₹{order.platformShare}</span></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-5">
            {/* Delivery Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Delivery Info</h3>
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><MapPin className="w-4 h-4" /></div><div><p className="text-xs text-gray-500">Distance</p><p className="text-sm font-semibold">{order.deliveryDistance} km</p></div></div>
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><Clock className="w-4 h-4" /></div><div><p className="text-xs text-gray-500">Delivery Time</p><p className="text-sm font-semibold">{order.deliveryTime || "—"} min</p></div></div>
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><IndianRupee className="w-4 h-4" /></div><div><p className="text-xs text-gray-500">Partner Earning</p><p className="text-sm font-semibold">₹{order.partnerShare}</p></div></div>
            </motion.div>

            {/* Customer */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Customer</h3>
              <Link to={`/admin/users/customers/${order.customerId}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white"><User className="w-4 h-4" /></div>
                <div><p className="text-sm font-semibold text-gray-900">{order.customerName}</p><p className="text-xs text-gray-500">{order.customerPhone}</p></div>
              </Link>
              <p className="text-xs text-gray-500 mt-2 ml-12">{order.deliveryAddress}</p>
            </motion.div>

            {/* Shop */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Shop</h3>
              <Link to={`/admin/shops/${order.shopId}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white"><Store className="w-4 h-4" /></div>
                <div><p className="text-sm font-semibold text-gray-900">{order.shopName}</p><p className="text-xs text-gray-500">{order.shopAddress}</p></div>
              </Link>
            </motion.div>

            {/* Delivery Partner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Delivery Partner</h3>
              <Link to={`/admin/users/delivery-partners/${order.deliveryPartnerId}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white"><Truck className="w-4 h-4" /></div>
                <div><p className="text-sm font-semibold text-gray-900">{order.deliveryPartnerName}</p><p className="text-xs text-gray-500">Delivery Partner</p></div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
