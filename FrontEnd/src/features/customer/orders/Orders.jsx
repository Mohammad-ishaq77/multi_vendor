import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  IndianRupee,
} from "lucide-react";
import CustomerShell from "../components/CustomerShell";
import orderService, { ORDERS_CHANGE_EVENT } from "../../../services/orderService";

const statusConfig = {
  Placed: {
    icon: Package,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
  Delivered: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Processing: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  Shipped: {
    icon: Truck,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
  },
  "Out for Delivery": {
    icon: Truck,
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    dot: "bg-teal-600",
  },
  Cancelled: {
    icon: XCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

const tabs = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

const Orders = () => {
  const [orders, setOrders] = useState(() => orderService.getCustomerOrders());
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const refresh = () => setOrders(orderService.getCustomerOrders());
    window.addEventListener(ORDERS_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(ORDERS_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = orders.filter((order) => {
    const matchesTab =
      activeTab === "All" ||
      order.status === activeTab ||
      (activeTab === "Processing" && order.status === "Placed");
    const matchesSearch =
      !searchQuery ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesTab && matchesSearch;
  });

  const statusCounts = {
    All: orders.length,
    Processing: orders.filter((o) => o.status === "Processing" || o.status === "Placed").length,
    Shipped: orders.filter((o) => o.status === "Shipped").length,
    Delivered: orders.filter((o) => o.status === "Delivered").length,
    Cancelled: orders.filter((o) => o.status === "Cancelled").length,
  };

  return (
    <CustomerShell>
      <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">Track and manage your purchases</p>
              <Link
                to="/customer/products"
                className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop Again
              </Link>
            </div>

          {orders.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 sm:py-24"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100"
              >
                <ShoppingBag className="w-11 h-11 text-gray-300" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
              <p className="text-sm text-gray-500 mt-2 max-w-xs text-center">
                Start shopping from your favorite local stores and track your orders here.
              </p>
              <Link
                to="/customer/products"
                className="mt-6 inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-md font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Search */}
              <div className="mb-5">
                <div className="relative max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-3 mb-5 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                      activeTab === tab
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                    {statusCounts[tab] > 0 && (
                      <span
                        className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${
                          activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {statusCounts[tab]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((order, index) => {
                    const config = statusConfig[order.status] || statusConfig.Processing;
                    const StatusIcon = config.icon;

                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: Math.min(index * 0.05, 0.2) }}
                        className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6 hover:shadow-lg hover:border-gray-200/80 transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Left */}
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${config.bg} border ${config.border}`}>
                              <StatusIcon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{order.id}</h3>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${config.bg} ${config.color} border ${config.border}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                  {order.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {order.date || "Recently"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" />
                                  {order.total}
                                </span>
                                <span>{order.items?.length || 0} items</span>
                              </div>
                            </div>
                          </div>

                          {/* Right */}
                          <div className="flex items-center gap-2 sm:pl-4">
                            <Link
                              to={`/customer/orders/${order.id}`}
                              className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all"
                            >
                              Details
                            </Link>
                            <Link
                              to={`/customer/orders/${order.id}/track`}
                              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20"
                            >
                              Track
                            </Link>
                          </div>
                        </div>

                        {/* Item Preview */}
                        {order.items?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-50">
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                              {order.items.slice(0, 5).map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 shrink-0 border border-gray-100"
                                >
                                  <div className="w-8 h-8 rounded-md bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                                    {item.image ? (
                                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-3.5 h-3.5 text-gray-300" />
                                    )}
                                  </div>
                                  <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate">{item.name}</span>
                                  <span className="text-xs text-gray-400">×{item.quantity}</span>
                                </div>
                              ))}
                              {order.items.length > 5 && (
                                <div className="flex items-center px-3 text-xs text-gray-400 font-medium">
                                  +{order.items.length - 5} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filtered.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No orders match your search.</p>
                  </motion.div>
                )}
              </div>
            </>
          )}
      </div>
    </CustomerShell>
  );
};

export default Orders;