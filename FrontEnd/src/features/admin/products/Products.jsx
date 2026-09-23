import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Eye,
  Ban,
  CheckCircle,
  Store,
  AlertTriangle,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusOptions = ["All", "active", "disabled", "out_of_stock"];
const statusLabels = { All: "All", active: "Active", disabled: "Disabled", out_of_stock: "Out of Stock" };
const statusBadge = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  disabled: "bg-rose-50 text-rose-700 border border-rose-200",
  out_of_stock: "bg-amber-50 text-amber-700 border border-amber-200",
};

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "totalOrders", label: "Orders" },
  { value: "stock", label: "Stock" },
];

function formatCurrency(amount) {
  if (amount == null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function Products() {
  const navigate = useNavigate();
  const { products, shops, disableProduct, enableProduct } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [shopFilter, setShopFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return ["All", ...cats];
  }, [products]);

  const shopOptions = useMemo(() => {
    const shopMap = {};
    shops.forEach((s) => { shopMap[s.id] = s.name; });
    const shopIds = [...new Set(products.map((p) => p.shopId).filter(Boolean))];
    return [
      { id: "All", name: "All Shops" },
      ...shopIds.map((id) => ({ id, name: shopMap[id] || id })),
    ];
  }, [products, shops]);

  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      const shop = shops.find((s) => s.id === p.shopId);
      return { ...p, shopName: shop?.name || "—" };
    });
  }, [products, shops]);

  const filteredProducts = useMemo(() => {
    let result = [...enrichedProducts];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.shopName?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (categoryFilter !== "All") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (shopFilter !== "All") {
      result = result.filter((p) => p.shopId === shopFilter);
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
  }, [enrichedProducts, search, statusFilter, categoryFilter, shopFilter, sortBy, sortDir]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const handleAction = (product, action) => {
    setConfirmModal({ product, action });
  };

  const confirmAction = () => {
    if (!confirmModal) return;
    const { product, action } = confirmModal;
    if (action === "disable") disableProduct(product.id);
    else enableProduct(product.id);
    setConfirmModal(null);
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
            Products Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all products across NearMart shops
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Products", value: products.length, color: "bg-teal-50 text-teal-700" },
            { label: "Active", value: products.filter((p) => p.status === "active").length, color: "bg-emerald-50 text-emerald-700" },
            { label: "Disabled", value: products.filter((p) => p.status === "disabled").length, color: "bg-rose-50 text-rose-700" },
            { label: "Out of Stock", value: products.filter((p) => p.status === "out_of_stock").length, color: "bg-amber-50 text-amber-700" },
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
                placeholder="Search products by name, shop, category..."
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
              {(statusFilter !== "All" || categoryFilter !== "All" || shopFilter !== "All") && (
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
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
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
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#155c43]/20 focus:border-[#155c43]"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shop</label>
                    <select
                      value={shopFilter}
                      onChange={(e) => setShopFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#155c43]/20 focus:border-[#155c43]"
                    >
                      {shopOptions.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Products Table */}
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
                    { key: "name", label: "Product" },
                    { key: "shopName", label: "Shop" },
                    { key: "category", label: "Category" },
                    { key: "price", label: "Price" },
                    { key: "stock", label: "Stock" },
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
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">No products found</p>
                      <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
                {filteredProducts.map((product, idx) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.02 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {product.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: "#14261f" }}>
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Store size={12} />
                        <span className="text-xs">{product.shopName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                        {product.category || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-[#155c43]">
                        {formatCurrency(product.price)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-md ${
                          (product.stock || product.stockQuantity || 0) > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {product.stock ?? product.stockQuantity ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                          statusBadge[product.status] || "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {product.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}`)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#155c43] hover:bg-emerald-50 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {product.status === "active" ? (
                          <button
                            onClick={() => handleAction(product, "disable")}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Disable Product"
                          >
                            <Ban size={16} />
                          </button>
                        ) : product.status === "disabled" ? (
                          <button
                            onClick={() => handleAction(product, "enable")}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Enable Product"
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
                      confirmModal.action === "disable"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {confirmModal.action === "disable" ? (
                      <AlertTriangle size={24} />
                    ) : (
                      <CheckCircle size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                      {confirmModal.action === "disable" ? "Disable Product" : "Enable Product"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {confirmModal.action === "disable"
                        ? "This product will be hidden from customers"
                        : "This product will be visible to customers again"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to {confirmModal.action}{" "}
                  <span className="font-semibold">{confirmModal.product?.name}</span>?
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
                      confirmModal.action === "disable"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {confirmModal.action === "disable" ? "Disable" : "Enable"}
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
