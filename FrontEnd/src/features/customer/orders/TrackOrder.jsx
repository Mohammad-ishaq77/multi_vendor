import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Home,
} from "lucide-react";
import CustomerShell from "../components/CustomerShell";

const steps = [
  { key: "Placed", label: "Order Placed", desc: "We received your order" },
  { key: "Processing", label: "Processing", desc: "Preparing your items" },
  { key: "Shipped", label: "Shipped", desc: "Handed to delivery partner" },
  { key: "Out for Delivery", label: "Out for Delivery", desc: "Arriving soon" },
  { key: "Delivered", label: "Delivered", desc: "Package received" },
];

const stepIcons = {
  Placed: Package,
  Processing: Clock,
  Shipped: Truck,
  "Out for Delivery": MapPin,
  Delivered: Home,
};

const statusConfig = {
  Delivered: "bg-emerald-500",
  Processing: "bg-amber-500",
  Shipped: "bg-emerald-500",
  "Out for Delivery": "bg-teal-600",
  Placed: "bg-gray-400",
};

const TrackOrder = () => {
  const { orderId } = useParams();
  const orders = JSON.parse(localStorage.getItem("nearmart_orders") || "[]");
  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <CustomerShell>
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">
            Order Not Found
          </h2>
          <Link
            to="/customer/orders"
            className="text-[#1B4332] font-medium hover:underline"
          >
            ← Back to Orders
          </Link>
        </div>
      </CustomerShell>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === order.status);
  const activeIndex = currentIndex === -1 ? 1 : currentIndex;

  return (
    <CustomerShell>
      <div className="w-full">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to={`/customer/orders/${orderId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1B4332] hover:text-[#143728] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Order Details
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8 text-center"
        >
          <div
            className={`w-14 h-14 rounded-full ${
              statusConfig[order.status] || "bg-gray-400"
            } flex items-center justify-center mx-auto mb-4`}
          >
            <Truck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">
            {order.status}
          </h1>
          <p className="text-sm text-[#64748B]">
            {order.id} · Estimated: 20–30 mins
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm"
        >
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-8">
            Tracking History
          </h3>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100" />

            {steps.map((step, index) => {
              const Icon = stepIcons[step.key];
              const isActive = index <= activeIndex;
              const isCurrent = index === activeIndex;

              return (
                <div key={step.key} className="relative flex gap-4 mb-8 last:mb-0">
                  {/* Icon */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      isActive
                        ? "bg-[#1B4332] border-[#1B4332] text-white"
                        : "bg-white border-gray-200 text-gray-300"
                    } ${isCurrent ? "ring-4 ring-[#1B4332]/10" : ""}`}
                  >
                    {isActive && !isCurrent ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="pt-1">
                    <h4
                      className={`text-sm font-bold ${
                        isActive ? "text-[#0F172A]" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isActive ? "text-[#64748B]" : "text-gray-300"
                      }`}
                    >
                      {isCurrent
                        ? "In progress..."
                        : isActive
                        ? "Completed"
                        : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </CustomerShell>
  );
};

export default TrackOrder;