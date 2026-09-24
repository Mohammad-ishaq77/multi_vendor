import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Tag,
  IndianRupee,
  ShoppingCart,
  Star,
  AlertTriangle,
  CheckCircle,
  Ban,
  ExternalLink,
  Hash,
  Box,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusBadge = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  disabled: "bg-rose-50 text-rose-700 border border-rose-200",
  out_of_stock: "bg-amber-50 text-amber-700 border border-amber-200",
};

function formatCurrency(amount) {
  if (amount == null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, shops, orders, disableProduct, enableProduct } = useAdmin();
  const [confirmModal, setConfirmModal] = useState(null);

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);

  const shop = useMemo(
    () => shops.find((s) => s.id === product?.shopId),
    [shops, product]
  );

  const productOrders = useMemo(
    () => orders.filter((o) => o.items?.some((item) => item.productId === productId || item.name === product?.name)),
    [orders, productId, product]
  );

  const deliveredOrders = useMemo(
    () => productOrders.filter((o) => o.status === "delivered"),
    [productOrders]
  );

  const totalRevenue = useMemo(
    () => deliveredOrders.reduce((sum, o) => sum + (o.productAmount || o.totalAmount || 0), 0),
    [deliveredOrders]
  );

  const avgRating = useMemo(() => {
    const rated = productOrders.filter((o) => o.rating);
    if (rated.length === 0) return "—";
    return (rated.reduce((sum, o) => sum + o.rating, 0) / rated.length).toFixed(1);
  }, [productOrders]);

  const handleAction = () => {
    if (!product) return;
    setConfirmModal(true);
  };

  const confirmAction = () => {
    if (!product) return;
    if (product.status === "active") disableProduct(product.id);
    else enableProduct(product.id);
    setConfirmModal(null);
  };

  if (!product) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold" style={{ color: "#14261f" }}>Product Not Found</h2>
          <p className="text-gray-500 mt-2">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/admin/products")}
            className="mt-6 px-4 py-2 bg-[#155c43] text-white rounded-md text-sm font-semibold hover:bg-[#114a36] transition-colors"
          >
            Back to Products
          </button>
        </div>
      </PageTransition>
    );
  }

  const stock = product.stock ?? product.stockQuantity ?? 0;

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
            onClick={() => navigate("/admin/products")}
            className="p-2 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors self-start"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#14261f" }}>
                {product.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${
                  statusBadge[product.status] || "bg-gray-50 text-gray-600"
                }`}
              >
                {product.status?.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{product.category || "—"} • {product.id}</p>
          </div>
          <div className="flex gap-2">
            {product.status === "active" ? (
              <button
                onClick={handleAction}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-md text-sm font-semibold hover:bg-rose-100 transition-colors"
              >
                <Ban size={16} />
                Disable Product
              </button>
            ) : (
              <button
                onClick={handleAction}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-md text-sm font-semibold hover:bg-emerald-100 transition-colors"
              >
                <CheckCircle size={16} />
                Enable Product
              </button>
            )}
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
            { icon: IndianRupee, label: "Price", value: formatCurrency(product.price), color: "from-[#155c43] to-emerald-400" },
            { icon: Box, label: "Stock", value: stock, color: stock > 0 ? "from-blue-600 to-blue-400" : "from-rose-600 to-rose-400" },
            { icon: ShoppingCart, label: "Orders", value: productOrders.length, color: "from-violet-600 to-violet-400" },
            { icon: Star, label: "Rating", value: avgRating, color: "from-amber-500 to-amber-400" },
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
                  <p className="mt-2 text-2xl font-bold" style={{ color: "#14261f" }}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-md bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">Product Image</p>
                  <p className="text-xs text-gray-300 mt-1">{product.image || "No image available"}</p>
                </div>
              </div>
            </motion.div>

            {/* Product Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-5" style={{ color: "#14261f" }}>
                Product Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Package, label: "Product Name", value: product.name },
                  { icon: Tag, label: "Category", value: product.category || "—" },
                  { icon: IndianRupee, label: "Price", value: formatCurrency(product.price) },
                  { icon: IndianRupee, label: "Original Price", value: product.originalPrice ? formatCurrency(product.originalPrice) : "—" },
                  { icon: Box, label: "Stock", value: stock },
                  { icon: Hash, label: "Product ID", value: product.id },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
                    <item.icon size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                      <p className="text-sm font-semibold" style={{ color: "#14261f" }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {product.description && (
                <div className="mt-4 p-4 rounded-md bg-gray-50">
                  <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              )}
            </motion.div>

            {/* Orders using this product */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 pb-0">
                <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                  Orders ({productOrders.length})
                </h3>
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-400">
                          No orders found for this product
                        </td>
                      </tr>
                    )}
                    {productOrders.slice(0, 8).map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-3">
                          <span className="font-mono text-xs font-semibold text-[#155c43]">{order.id}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="font-medium" style={{ color: "#14261f" }}>{order.customerName}</span>
                        </td>
                        <td className="px-6 py-3 text-right font-semibold" style={{ color: "#14261f" }}>
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                            order.status === "delivered" ? "bg-emerald-50 text-emerald-700" :
                            order.status === "cancelled" ? "bg-rose-50 text-rose-700" :
                            order.status === "out_for_delivery" ? "bg-indigo-50 text-indigo-700" :
                            order.status === "confirmed" ? "bg-blue-50 text-blue-700" :
                            "bg-amber-50 text-amber-700"
                          }`}>
                            {order.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Shop Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                Shop
              </h3>
              {shop ? (
                <div
                  className="flex items-center gap-3 p-3 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => navigate(`/admin/shops/${shop.id}`)}
                >
                  <div className="w-11 h-11 rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {shop.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: "#14261f" }}>{shop.name}</p>
                    <p className="text-xs text-gray-400">{shop.category || shop.type || "—"}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400" />
                </div>
              ) : (
                <div className="p-3 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-500">{product.shopId || "—"}</p>
                </div>
              )}
            </motion.div>

            {/* Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Total Orders</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>{productOrders.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Delivered</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>{deliveredOrders.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Revenue</span>
                  <span className="text-sm font-semibold text-[#155c43]">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Avg Rating</span>
                  <div className="flex items-center gap-1">
                    {avgRating !== "—" && <Star size={14} className="text-amber-400 fill-amber-400" />}
                    <span className="text-sm font-semibold" style={{ color: "#14261f" }}>{avgRating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Current Stock</span>
                  <span className={`text-sm font-semibold ${stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {stock} units
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stock Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`rounded-lg border p-6 ${
                stock > 0
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-rose-50 border-rose-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {stock > 0 ? (
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-rose-600" />
                )}
                <div>
                  <p className={`font-bold ${stock > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {stock > 0 ? "In Stock" : "Out of Stock"}
                  </p>
                  <p className={`text-sm ${stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {stock > 0 ? `${stock} units available` : "This product is currently unavailable"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

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
                      product.status === "active"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {product.status === "active" ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                      {product.status === "active" ? "Disable Product" : "Enable Product"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {product.status === "active"
                        ? "This product will be hidden from customers"
                        : "This product will be visible to customers again"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to {product.status === "active" ? "disable" : "enable"}{" "}
                  <span className="font-semibold">{product.name}</span>?
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
                      product.status === "active"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {product.status === "active" ? "Disable" : "Enable"}
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
