import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Receipt,
  Download,
} from "lucide-react";
import CustomerShell from "../components/CustomerShell";

const statusConfig = {
  Placed: {
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: Package,
  },
  Delivered: {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  Processing: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
  },
  Shipped: {
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: Truck,
  },
  "Out for Delivery": {
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: Package,
  },
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const orders = JSON.parse(localStorage.getItem("nearmart_orders") || "[]");
  const order = orders.find((item) => item.id === orderId);

  const downloadInvoice = () => {
    const lines = [
      `NearMart invoice: ${order.id}`,
      `Date: ${order.date || new Date(order.createdAt).toLocaleDateString()}`,
      `Customer: ${order.customer?.fullName || "Customer"}`,
      "",
      ...(order.items || []).map((item) => `${item.name} x ${item.quantity}: Rs ${item.price * item.quantity}`),
      "",
      `Subtotal: Rs ${order.subtotal ?? order.total}`,
      `Delivery: Rs ${order.deliveryFee ?? 0}`,
      `Total: Rs ${order.total}`,
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${order.id}-invoice.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!order) {
    return (
      <CustomerShell>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">
            Order Not Found
          </h2>
          <p className="text-sm text-[#64748B] mb-6">
            We couldn't find this order in your history.
          </p>
          <Link
            to="/customer/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] text-white text-sm font-semibold rounded-md hover:bg-[#143728] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </CustomerShell>
    );
  }

  const config = statusConfig[order.status] || statusConfig.Processing;
  const StatusIcon = config.icon;

  return (
    <CustomerShell>
      <div className="w-full">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/customer/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1B4332] hover:text-[#143728] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            All Orders
          </Link>
        </motion.div>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-1">
                {order.id}
              </h1>
              <p className="text-sm text-[#64748B]">
                Placed on {order.date || "—"}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${config.bg} ${config.color} ${config.border} border`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {order.status}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
            <Link
              to={`/customer/orders/${order.id}/track`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1B4332] text-white text-sm font-semibold rounded-md hover:bg-[#143728] transition-colors"
            >
              <Truck className="w-4 h-4" />
              Track Order
            </Link>
              <button onClick={downloadInvoice} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-sm font-semibold text-[#0F172A] rounded-md hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Invoice
            </button>
          </div>
        </motion.div>

        {/* Items List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm mb-6"
        >
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">
            Order Items
          </h3>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
              >
                <div className="w-16 h-16 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[#0F172A] truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#0F172A]">
                    ₹{item.price * item.quantity}
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    ₹{item.price} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Summary & Address */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-4 h-4 text-[#1B4332]" />
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                Summary
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal</span>
                <span>₹{order.subtotal ?? order.total}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee ?? 0}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Tax</span>
                <span>₹0</span>
              </div>
              <div className="h-px bg-gray-100 my-3" />
              <div className="flex justify-between font-bold text-[#0F172A] text-base">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </motion.div>

          {/* Delivery Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#1B4332]" />
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                Delivery Address
              </h3>
            </div>
            <p className="text-sm text-[#0F172A] font-medium leading-relaxed">
              {order.customer ? `${order.customer.fullName}, ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}` : order.address || "NearMart HQ, Srinagar, Jammu & Kashmir, India"}
            </p>
            <p className="text-xs text-[#64748B] mt-2">
              Estimated delivery:{" "}
              <span className="font-semibold text-[#1B4332]">
                20–30 mins
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </CustomerShell>
  );
};

export default OrderDetails;