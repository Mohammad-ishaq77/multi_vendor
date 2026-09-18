import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  User,
  Store,
  Truck,
  Package,
  IndianRupee,
  CreditCard,
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Navigation,
  Timer,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border border-blue-200", dot: "bg-blue-500" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-indigo-50 text-indigo-700 border border-indigo-200", dot: "bg-indigo-500" },
  delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border border-rose-200", dot: "bg-rose-500" },
};

const timelineSteps = [
  { key: "placed", label: "Order Placed", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const statusOrder = { pending: 0, confirmed: 1, preparing: 2, out_for_delivery: 3, delivered: 4, cancelled: -1 };

function formatCurrency(amount) {
  if (amount == null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, shops, customers, deliveryPartners, updateOrderStatus } = useAdmin();
  const [confirmStatus, setConfirmStatus] = useState(null);

  const order = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);
  const shop = useMemo(() => shops.find((s) => s.id === order?.shopId), [shops, order]);
  const customer = useMemo(
    () => customers.find((c) => c.id === order?.customerId),
    [customers, order]
  );
  const deliveryPartner = useMemo(
    () => deliveryPartners.find((dp) => dp.id === order?.deliveryPartnerId),
    [deliveryPartners, order]
  );

  const revenue = useMemo(() => {
    if (!order) return null;
    const productAmount = order.productAmount || order.totalAmount || 0;
    const deliveryFee = order.deliveryFee || 0;
    const partnerShare = order.partnerShare || Math.round(deliveryFee * 0.8);
    const platformShare = order.platformShare || Math.round(deliveryFee * 0.2);
    const platformFee = order.platformFee || 0;
    return {
      productAmount,
      toShopkeeper: productAmount,
      deliveryFee,
      partnerShare,
      platformShare,
      platformFee,
      totalToNearMart: platformShare + platformFee,
      totalCustomerPayment: productAmount + deliveryFee,
    };
  }, [order]);

  const nextStatusMap = {
    pending: "confirmed",
    confirmed: "out_for_delivery",
    out_for_delivery: "delivered",
  };

  const handleStatusUpdate = (newStatus) => {
    setConfirmStatus(newStatus);
  };

  const confirmStatusUpdate = () => {
    if (confirmStatus && order) {
      updateOrderStatus(order.id, confirmStatus);
    }
    setConfirmStatus(null);
  };

  if (!order) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold" style={{ color: "#14261f" }}>Order Not Found</h2>
          <p className="text-gray-500 mt-2">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/admin/orders")}
            className="mt-6 px-4 py-2 bg-[#155c43] text-white rounded-md text-sm font-semibold hover:bg-[#114a36] transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </PageTransition>
    );
  }

  const config = statusConfig[order.status] || statusConfig.pending;
  const currentStepIndex = statusOrder[order.status] ?? -1;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <button
            onClick={() => navigate("/admin/orders")}
            className="p-2 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors self-start"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#14261f" }}>
                Order {order.id}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold capitalize ${config.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                {config.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {formatDateTime(order.createdAt || order.orderDate)}
            </p>
          </div>
          {nextStatusMap[order.status] && (
            <button
              onClick={() => handleStatusUpdate(nextStatusMap[order.status])}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#155c43] text-white rounded-md text-sm font-semibold hover:bg-[#114a36] transition-colors"
            >
              <ArrowRight size={16} />
              Mark as {statusConfig[nextStatusMap[order.status]]?.label}
            </button>
          )}
        </motion.div>

        {/* Order Info + Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { icon: IndianRupee, label: "Total Amount", value: formatCurrency(order.totalAmount + (order.deliveryFee || 0)), color: "from-[#155c43] to-emerald-400" },
            { icon: CreditCard, label: "Payment", value: order.paymentMethod || "—", color: "from-blue-600 to-blue-400" },
            { icon: Calendar, label: "Order Date", value: formatDate(order.createdAt || order.orderDate), color: "from-violet-600 to-violet-400" },
            { icon: Timer, label: "Delivery Time", value: order.deliveryTime ? `${order.deliveryTime} min` : "—", color: "from-amber-500 to-amber-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-2 text-xl font-bold" style={{ color: "#14261f" }}>{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-6" style={{ color: "#14261f" }}>
                Order Timeline
              </h3>
              <div className="relative">
                {timelineSteps.map((step, idx) => {
                  const stepStatus = statusOrder[step.key] ?? -1;
                  const isCompleted = order.status !== "cancelled" && currentStepIndex >= stepStatus;
                  const isCurrent = order.status === step.key;
                  const isCancelled = order.status === "cancelled" && idx === 0;

                  return (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      {idx < timelineSteps.length - 1 && (
                        <div
                          className={`absolute left-4 top-8 w-0.5 h-10 ${
                            isCompleted ? "bg-[#155c43]" : "bg-gray-200"
                          }`}
                        />
                      )}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          isCompleted
                            ? "bg-[#155c43] text-white"
                            : isCurrent
                            ? "bg-[#155c43] text-white ring-4 ring-[#155c43]/20"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircle size={14} />
                        ) : (
                          <step.icon size={14} />
                        )}
                      </div>
                      <div className="pb-8">
                        <p
                          className={`text-sm font-semibold ${
                            isCompleted ? "text-[#14261f]" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-[#155c43] font-medium mt-0.5">Current step</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {order.status === "cancelled" && (
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 z-10">
                      <XCircle size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-rose-600">Cancelled</p>
                      {order.cancellationReason && (
                        <p className="text-xs text-gray-500 mt-0.5">{order.cancellationReason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 pb-0">
                <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                  Order Items ({order.items?.length || 0})
                </h3>
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              <Package size={14} />
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: "#14261f" }}>{item.name}</p>
                              <p className="text-xs text-gray-400 font-mono">{item.productId || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-md">
                            {item.quantity || item.qty}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-600">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-semibold" style={{ color: "#14261f" }}>
                          {formatCurrency((item.quantity || item.qty || 1) * item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Payment Breakdown */}
            {revenue && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
              >
                <h3 className="text-lg font-bold mb-5" style={{ color: "#14261f" }}>
                  Payment Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Product Amount → Shopkeeper</span>
                    </div>
                    <span className="text-sm font-bold text-[#155c43]">{formatCurrency(revenue.productAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Delivery Fee</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "#14261f" }}>{formatCurrency(revenue.deliveryFee)}</span>
                  </div>

                  <div className="ml-6 flex items-center justify-between p-2.5 rounded-lg bg-blue-50/50">
                    <span className="text-xs text-blue-600">→ 80% to Delivery Partner</span>
                    <span className="text-xs font-bold text-blue-700">{formatCurrency(revenue.partnerShare)}</span>
                  </div>
                  <div className="ml-6 flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50">
                    <span className="text-xs text-emerald-600">→ 20% to NearMart</span>
                    <span className="text-xs font-bold text-emerald-700">{formatCurrency(revenue.platformShare)}</span>
                  </div>

                  {revenue.platformFee > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">Platform Fee</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: "#14261f" }}>{formatCurrency(revenue.platformFee)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center justify-between p-3 rounded-md bg-[#155c43]/5">
                      <span className="text-sm font-bold" style={{ color: "#14261f" }}>Total Customer Payment</span>
                      <span className="text-lg font-bold text-[#155c43]">{formatCurrency(revenue.totalCustomerPayment)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Delivery Info */}
            {(order.deliveryAddress || order.deliveryDistance) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                  Delivery Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {order.deliveryAddress && (
                    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
                      <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Delivery Address</p>
                        <p className="text-sm font-semibold" style={{ color: "#14261f" }}>{order.deliveryAddress}</p>
                      </div>
                    </div>
                  )}
                  {order.shopAddress && (
                    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
                      <Store size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Pickup Address</p>
                        <p className="text-sm font-semibold" style={{ color: "#14261f" }}>{order.shopAddress}</p>
                      </div>
                    </div>
                  )}
                  {order.deliveryDistance && (
                    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
                      <Navigation size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Distance</p>
                        <p className="text-sm font-semibold" style={{ color: "#14261f" }}>{order.deliveryDistance} km</p>
                      </div>
                    </div>
                  )}
                  {order.deliveryTime && (
                    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
                      <Timer size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Delivery Time</p>
                        <p className="text-sm font-semibold" style={{ color: "#14261f" }}>{order.deliveryTime} minutes</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                Customer
              </h3>
              <div
                className="flex items-center gap-3 p-3 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => customer && navigate(`/admin/customers/${customer.id}`)}
              >
                <div className="w-11 h-11 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {order.customerName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: "#14261f" }}>{order.customerName}</p>
                  <p className="text-xs text-gray-400">{order.customerPhone || "—"}</p>
                </div>
                <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
              </div>
            </motion.div>

            {/* Shopkeeper Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                Shop
              </h3>
              <div
                className="flex items-center gap-3 p-3 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => shop && navigate(`/admin/shops/${shop.id}`)}
              >
                <div className="w-11 h-11 rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {shop?.name?.charAt(0) || order.shopDisplayName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: "#14261f" }}>
                    {shop?.name || order.shopDisplayName}
                  </p>
                  <p className="text-xs text-gray-400">{shop?.category || shop?.type || "—"}</p>
                </div>
                <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
              </div>
            </motion.div>

            {/* Delivery Partner Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                Delivery Partner
              </h3>
              {order.deliveryPartnerName ? (
                <div
                  className="flex items-center gap-3 p-3 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => deliveryPartner && navigate(`/admin/delivery-partners/${deliveryPartner.id}`)}
                >
                  <div className="w-11 h-11 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                    {order.deliveryPartnerName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: "#14261f" }}>{order.deliveryPartnerName}</p>
                    <p className="text-xs text-gray-400">{order.deliveryPartnerId || "—"}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                </div>
              ) : (
                <div className="p-3 rounded-md bg-gray-50 text-center">
                  <Truck size={20} className="text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Not assigned yet</p>
                </div>
              )}
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                Payment
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Method</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>
                    {order.paymentMethod || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Status</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      order.paymentStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : order.paymentStatus === "refunded"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.paymentStatus || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Product Amount</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>
                    {formatCurrency(revenue?.productAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Delivery Fee</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>
                    {formatCurrency(revenue?.deliveryFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between p-3 rounded-md bg-[#155c43]/5">
                    <span className="text-sm font-bold" style={{ color: "#14261f" }}>Total</span>
                    <span className="text-lg font-bold text-[#155c43]">
                      {formatCurrency(order.totalAmount + (order.deliveryFee || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Rating */}
            {order.rating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                  Customer Review
                </h3>
                <div className="p-4 rounded-md bg-amber-50">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= order.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                      />
                    ))}
                    <span className="ml-2 text-sm font-bold text-amber-700">{order.rating}/5</span>
                  </div>
                  {order.review && (
                    <p className="text-sm text-gray-600 italic">"{order.review}"</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Cancellation Info */}
            {order.status === "cancelled" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="bg-rose-50 rounded-lg border border-rose-200 p-6"
              >
                <h3 className="text-lg font-bold mb-3 text-rose-700">
                  Cancellation Details
                </h3>
                <div className="space-y-2">
                  {order.cancellationReason && (
                    <div className="flex items-center gap-2 text-sm text-rose-600">
                      <AlertCircle size={14} />
                      <span>Reason: {order.cancellationReason}</span>
                    </div>
                  )}
                  {order.cancelledBy && (
                    <div className="flex items-center gap-2 text-sm text-rose-600">
                      <User size={14} />
                      <span>Cancelled by: {order.cancelledBy}</span>
                    </div>
                  )}
                  {order.cancelledAt && (
                    <div className="flex items-center gap-2 text-sm text-rose-600">
                      <Clock size={14} />
                      <span>At: {formatDateTime(order.cancelledAt)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Status Update Modal */}
        <AnimatePresence>
          {confirmStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setConfirmStatus(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-md bg-[#155c43]/10 flex items-center justify-center">
                    <ArrowRight size={24} className="text-[#155c43]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                      Update Order Status
                    </h3>
                    <p className="text-sm text-gray-500">Confirm status change</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to change the status of order{" "}
                  <span className="font-semibold">{order.id}</span> to{" "}
                  <span className="font-semibold">{statusConfig[confirmStatus]?.label}</span>?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmStatus(null)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusUpdate}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#155c43] rounded-md hover:bg-[#114a36] transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
