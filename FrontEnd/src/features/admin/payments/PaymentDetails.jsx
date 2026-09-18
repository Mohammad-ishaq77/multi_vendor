import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, IndianRupee, User, Store, Truck, CreditCard, CheckCircle } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusColors = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  refunded: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function PaymentDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders } = useAdmin();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <IndianRupee className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Payment not found</h2>
          <Link to="/admin/payments" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#155c43] hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Payments</Link>
        </div>
      </PageTransition>
    );
  }

  const status = order.paymentStatus || "paid";

  return (
    <PageTransition>
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/payments")} className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#155c43] hover:border-emerald-200 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#14261f]">Payment {order.id}</h1>
            <p className="text-sm text-gray-500">Financial transaction details</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status] || ""}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>

        {/* Financial Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Financial Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl"><span className="text-sm text-emerald-700">Product Amount → Shopkeeper</span><span className="text-sm font-bold text-emerald-800">₹{order.productAmount}</span></div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl"><span className="text-sm text-blue-700">Delivery Fee → Partner (80%)</span><span className="text-sm font-bold text-blue-800">₹{order.partnerShare}</span></div>
            <div className="flex justify-between items-center p-3 bg-violet-50 rounded-xl"><span className="text-sm text-violet-700">Delivery Fee → NearMart (20%)</span><span className="text-sm font-bold text-violet-800">₹{order.platformShare}</span></div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center"><span className="text-sm font-semibold text-gray-700">Total Customer Payment</span><span className="text-lg font-bold text-[#155c43]">₹{order.totalAmount}</span></div>
            <div className="flex justify-between items-center text-xs text-gray-500 pt-1"><span>Platform Revenue</span><span className="font-semibold text-[#155c43]">₹{order.platformShare}</span></div>
          </div>
        </motion.div>

        {/* Order Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Order Info</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-gray-500">Order ID</p><p className="font-semibold text-[#155c43]">{order.id}</p></div>
            <div><p className="text-xs text-gray-500">Date</p><p className="font-semibold">{new Date(order.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
            <div><p className="text-xs text-gray-500">Payment Method</p><p className="font-semibold">{order.paymentMethod}</p></div>
            <div><p className="text-xs text-gray-500">Status</p><p className="font-semibold capitalize">{status}</p></div>
          </div>
        </motion.div>

        {/* Customer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Customer</h3>
          <Link to={`/admin/users/customers/${order.customerId}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white"><User className="w-4 h-4" /></div>
            <div><p className="text-sm font-semibold">{order.customerName}</p><p className="text-xs text-gray-500">{order.customerPhone}</p></div>
          </Link>
        </motion.div>

        {/* Shop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Shop</h3>
          <Link to={`/admin/shops/${order.shopId}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white"><Store className="w-4 h-4" /></div>
            <div><p className="text-sm font-semibold">{order.shopName}</p><p className="text-xs text-gray-500">{order.shopAddress}</p></div>
          </Link>
        </motion.div>

        {/* Delivery Partner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Delivery Partner</h3>
          <Link to={`/admin/users/delivery-partners/${order.deliveryPartnerId}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white"><Truck className="w-4 h-4" /></div>
            <div><p className="text-sm font-semibold">{order.deliveryPartnerName}</p><p className="text-xs text-gray-500">₹{order.partnerShare} earned</p></div>
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );
}
