import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Calendar,
  IndianRupee,
  User,
  Store,
  Truck,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusOptions = ["All", "pending", "confirmed", "out_for_delivery", "delivered", "cancelled"];
const statusLabels = {
  All: "All",
  pending: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const statusBadge = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  out_for_delivery: "bg-teal-50 text-teal-700 border border-teal-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
};

const statusDot = {
  pending: "bg-amber-500",
  confirmed: "bg-emerald-500",
  out_for_delivery: "bg-teal-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

const sortOptions = [
  { value: "createdAt", label: "Date" },
  { value: "totalAmount", label: "Amount" },
  { value: "status", label: "Status" },
];

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

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
}

export default function Orders() {
  const navigate = useNavigate();
  const { orders, shops } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  const shopMap = useMemo(() => {
    const map = {};
    shops.forEach((s) => { map[s.id] = s.name; });
    return map;
  }, [shops]);

  const enrichedOrders = useMemo(() => {
    return orders.map((o) => ({
      ...o,
      shopDisplayName: o.shopName || shopMap[o.shopId] || "—",
    }));
  }, [orders, shopMap]);

  const filteredOrders = useMemo(() => {
    let result = [...enrichedOrders];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.shopDisplayName?.toLowerCase().includes(q) ||
          o.deliveryPartnerName?.toLowerCase().includes(q) ||
          o.customerPhone?.includes(q)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((o) => o.status === statusFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === "createdAt" || sortBy === "orderDate") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal == null) aVal = 0;
      if (bVal == null) bVal = 0;
      if (sortDir === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [enrichedOrders, search, statusFilter, sortBy, sortDir]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#14261f" }}>
            Orders Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage all NearMart orders
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-4"
        >
          {[
            { label: "Total Orders", value: orders.length, color: "bg-gray-50 text-gray-700" },
            { label: "Pending", value: orders.filter((o) => o.status === "pending").length, color: "bg-amber-50 text-amber-700" },
            { label: "Confirmed", value: orders.filter((o) => o.status === "confirmed").length, color: "bg-blue-50 text-blue-700" },
            { label: "Out for Delivery", value: orders.filter((o) => o.status === "out_for_delivery").length, color: "bg-indigo-50 text-indigo-700" },
            { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length, color: "bg-emerald-50 text-emerald-700" },
          ].map((stat) => (
            <div key={stat.label} className={`p-4 rounded-md ${stat.color}`}>
              <p className="text-xs font-medium opacity-70">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer, shop, delivery partner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#155c43]/20 focus:border-[#155c43] transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md border transition-colors ${
                showFilters
                  ? "bg-[#155c43] text-white border-[#155c43]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {statusFilter !== "All" && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          statusFilter === s
                            ? "bg-[#155c43] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Sort By
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#155c43]/20 focus:border-[#155c43]"
                        >
                          {sortOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                          className="p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <ArrowUpDown size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Shop
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Delivery Partner
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Date
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">No orders found</p>
                      <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
                {filteredOrders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.02 }}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold text-[#155c43]">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {order.customerName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate" style={{ color: "#14261f" }}>
                            {order.customerName}
                          </p>
                          {order.customerPhone && (
                            <p className="text-xs text-gray-400 truncate">{order.customerPhone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-gray-500 text-xs">{order.shopDisplayName}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-gray-500 text-xs">
                        {order.deliveryPartnerName || (
                          <span className="text-gray-300">Not assigned</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-semibold" style={{ color: "#14261f" }}>
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                          statusBadge[order.status] || "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[order.status] || "bg-gray-400"}`} />
                        {order.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                      <div>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt || order.orderDate)}</p>
                        <p className="text-[10px] text-gray-400">{formatTime(order.createdAt || order.orderDate)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/orders/${order.id}`);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#155c43] hover:bg-emerald-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Showing {filteredOrders.length} of {orders.length} orders</span>
              <span className="font-medium text-[#155c43]">
                Total: {formatCurrency(filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
