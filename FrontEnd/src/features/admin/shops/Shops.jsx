import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Store,
  Eye,
  Ban,
  CheckCircle,
  Star,
  MapPin,
  Package,
  ShoppingBag,
  IndianRupee,
  X,
  AlertTriangle,
  SlidersHorizontal,
  ArrowUpDown,
  Grid3X3,
  List,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusOptions = ["All", "active", "suspended", "pending"];
const statusLabels = { All: "All", active: "Active", suspended: "Suspended", pending: "Pending" };
const statusBadge = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  suspended: "bg-rose-50 text-rose-700 border border-rose-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
};

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "totalRevenue", label: "Revenue" },
  { value: "rating", label: "Rating" },
  { value: "totalOrders", label: "Orders" },
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

export default function Shops() {
  const navigate = useNavigate();
  const { shops, suspendShop, activateShop } = useAdmin();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  const shopTypes = useMemo(() => {
    const types = [...new Set(shops.map((s) => s.category || s.type).filter(Boolean))];
    return ["All", ...types];
  }, [shops]);

  const filteredShops = useMemo(() => {
    let result = [...shops];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.ownerName?.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q) ||
          s.area?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.type?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (typeFilter !== "All") {
      result = result.filter((s) => (s.category || s.type) === typeFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal == null) aVal = 0;
      if (bVal == null) bVal = 0;
      if (sortDir === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [shops, search, statusFilter, typeFilter, sortBy, sortDir]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const handleAction = (shop, action) => {
    setConfirmModal({ shop, action });
  };

  const confirmAction = () => {
    if (!confirmModal) return;
    const { shop, action } = confirmModal;
    if (action === "suspend") suspendShop(shop.id);
    else if (action === "activate") activateShop(shop.id);
    setConfirmModal(null);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#14261f" }}>
              Shops Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage all shops on the NearMart platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-[#155c43] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[#155c43] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Shops", value: shops.length, color: "bg-cyan-50 text-cyan-700" },
            { label: "Active", value: shops.filter((s) => s.status === "active").length, color: "bg-emerald-50 text-emerald-700" },
            { label: "Suspended", value: shops.filter((s) => s.status === "suspended").length, color: "bg-rose-50 text-rose-700" },
            { label: "Pending", value: shops.filter((s) => s.status === "pending").length, color: "bg-amber-50 text-amber-700" },
          ].map((stat, i) => (
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
                placeholder="Search shops by name, owner, location..."
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
              {(statusFilter !== "All" || typeFilter !== "All") && (
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
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
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
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Shop Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#155c43]/20 focus:border-[#155c43]"
                    >
                      {shopTypes.map((t) => (
                        <option key={t} value={t}>
                          {t === "All" ? "All Types" : t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
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
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Table View */}
        {viewMode === "table" && (
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
                    {[
                      { key: "name", label: "Shop Name" },
                      { key: "ownerName", label: "Owner" },
                      { key: "category", label: "Type" },
                      { key: "city", label: "Location" },
                      { key: "totalProducts", label: "Products" },
                      { key: "totalOrders", label: "Orders" },
                      { key: "totalRevenue", label: "Revenue" },
                      { key: "rating", label: "Rating" },
                      { key: "status", label: "Status" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortBy === col.key && (
                            sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShops.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-16">
                        <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No shops found</p>
                        <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  )}
                  {filteredShops.map((shop, idx) => (
                    <motion.tr
                      key={shop.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.02 }}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {shop.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: "#14261f" }}>
                              {shop.name}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">{shop.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-gray-600">{shop.ownerName || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                          {shop.category || shop.type || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin size={12} />
                          <span className="text-xs">{shop.city || shop.area || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium" style={{ color: "#14261f" }}>
                          {shop.totalProducts ?? shop.products?.length ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium" style={{ color: "#14261f" }}>
                          {shop.totalOrders ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-[#155c43]">
                          {formatCurrency(shop.totalRevenue)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="font-medium" style={{ color: "#14261f" }}>
                            {shop.rating ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                            statusBadge[shop.status] || "bg-gray-50 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {shop.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/admin/shops/${shop.id}`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#155c43] hover:bg-emerald-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {shop.status === "active" ? (
                            <button
                              onClick={() => handleAction(shop, "suspend")}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Suspend Shop"
                            >
                              <Ban size={16} />
                            </button>
                          ) : shop.status === "suspended" ? (
                            <button
                              onClick={() => handleAction(shop, "activate")}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Activate Shop"
                            >
                              <CheckCircle size={16} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredShops.map((shop, idx) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/admin/shops/${shop.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {shop.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: "#14261f" }}>{shop.name}</h3>
                      <p className="text-xs text-gray-400 font-mono">{shop.id}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${
                      statusBadge[shop.status] || "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {shop.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{shop.description || shop.address}</p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <Package size={14} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs font-bold" style={{ color: "#14261f" }}>
                      {shop.totalProducts ?? shop.products?.length ?? 0}
                    </p>
                    <p className="text-[10px] text-gray-400">Products</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <ShoppingBag size={14} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs font-bold" style={{ color: "#14261f" }}>
                      {shop.totalOrders ?? 0}
                    </p>
                    <p className="text-[10px] text-gray-400">Orders</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <IndianRupee size={14} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs font-bold" style={{ color: "#14261f" }}>
                      {formatCurrency(shop.totalRevenue)}
                    </p>
                    <p className="text-[10px] text-gray-400">Revenue</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold" style={{ color: "#14261f" }}>
                      {shop.rating ?? "—"}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({shop.totalRatings ?? 0} ratings)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={12} />
                    {shop.city || shop.area || "—"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Confirm Modal */}
        <AnimatePresence>
          {confirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setConfirmModal(null)}
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
                  <div
                    className={`w-12 h-12 rounded-md flex items-center justify-center ${
                      confirmModal.action === "suspend"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {confirmModal.action === "suspend" ? (
                      <AlertTriangle size={24} />
                    ) : (
                      <CheckCircle size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                      {confirmModal.action === "suspend" ? "Suspend Shop" : "Activate Shop"}
                    </h3>
                    <p className="text-sm text-gray-500">This action can be reversed later</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to {confirmModal.action}{" "}
                  <span className="font-semibold">{confirmModal.shop.name}</span>?
                  {confirmModal.action === "suspend"
                    ? " The shop will be immediately taken offline and won't be able to receive orders."
                    : " The shop will be restored and can receive orders again."}
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAction}
                    className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors ${
                      confirmModal.action === "suspend"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {confirmModal.action === "suspend" ? "Suspend" : "Activate"}
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
