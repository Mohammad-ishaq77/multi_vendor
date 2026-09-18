import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Store,
  MapPin,
  Star,
  Phone,
  Mail,
  Clock,
  Package,
  ShoppingBag,
  IndianRupee,
  Users,
  Ban,
  CheckCircle,
  AlertTriangle,
  Truck,
  Globe,
  Shield,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusBadge = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  suspended: "bg-rose-50 text-rose-700 border border-rose-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
};

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

export default function ShopDetails() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { shops, orders, shopkeepers, products, suspendShop, activateShop } = useAdmin();
  const [confirmModal, setConfirmModal] = useState(null);

  const shop = useMemo(() => shops.find((s) => s.id === shopId), [shops, shopId]);

  const shopOrders = useMemo(
    () => orders.filter((o) => o.shopId === shopId),
    [orders, shopId]
  );

  const shopProducts = useMemo(() => {
    if (shop?.products?.length) return shop.products;
    return products.filter((p) => p.shopId === shopId);
  }, [shop, products, shopId]);

  const shopkeeper = useMemo(
    () => shopkeepers.find((sk) => sk.id === shop?.shopkeeperId || sk.shopId === shopId),
    [shopkeepers, shop, shopId]
  );

  const revenue = useMemo(
    () => shopOrders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalAmount, 0),
    [shopOrders]
  );

  const deliveredOrders = useMemo(
    () => shopOrders.filter((o) => o.status === "delivered").length,
    [shopOrders]
  );

  const avgRating = useMemo(() => {
    const rated = shopOrders.filter((o) => o.rating);
    if (rated.length === 0) return shop?.rating || 0;
    return (rated.reduce((sum, o) => sum + o.rating, 0) / rated.length).toFixed(1);
  }, [shopOrders, shop]);

  const handleAction = () => {
    if (!shop) return;
    setConfirmModal(true);
  };

  const confirmAction = () => {
    if (!shop) return;
    if (shop.status === "active") suspendShop(shop.id);
    else activateShop(shop.id);
    setConfirmModal(null);
  };

  if (!shop) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-20">
          <Store className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold" style={{ color: "#14261f" }}>Shop Not Found</h2>
          <p className="text-gray-500 mt-2">The shop you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/admin/shops")}
            className="mt-6 px-4 py-2 bg-[#155c43] text-white rounded-md text-sm font-semibold hover:bg-[#114a36] transition-colors"
          >
            Back to Shops
          </button>
        </div>
      </PageTransition>
    );
  }

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
            onClick={() => navigate("/admin/shops")}
            className="p-2 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors self-start"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#14261f" }}>
                {shop.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${
                  statusBadge[shop.status] || "bg-gray-50 text-gray-600"
                }`}
              >
                {shop.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{shop.category || shop.type} • {shop.id}</p>
          </div>
          <div className="flex gap-2">
            {shop.status === "active" ? (
              <button
                onClick={handleAction}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-md text-sm font-semibold hover:bg-rose-100 transition-colors"
              >
                <Ban size={16} />
                Suspend Shop
              </button>
            ) : (
              <button
                onClick={handleAction}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-md text-sm font-semibold hover:bg-emerald-100 transition-colors"
              >
                <CheckCircle size={16} />
                Activate Shop
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { icon: IndianRupee, label: "Revenue", value: formatCurrency(revenue), color: "from-[#155c43] to-emerald-400" },
            { icon: ShoppingBag, label: "Total Orders", value: shopOrders.length, color: "from-blue-600 to-blue-400" },
            { icon: Package, label: "Products", value: shopProducts.length, color: "from-violet-600 to-violet-400" },
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
          {/* Left Column - Shop Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shop Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-5" style={{ color: "#14261f" }}>
                Shop Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Store, label: "Shop Name", value: shop.name },
                  { icon: Globe, label: "Category", value: shop.category || shop.type || "—" },
                  { icon: MapPin, label: "Address", value: shop.address || "—" },
                  { icon: MapPin, label: "Area", value: shop.area || "—" },
                  { icon: MapPin, label: "City", value: shop.city || "—" },
                  { icon: Phone, label: "Phone", value: shop.phone || "—" },
                  { icon: Mail, label: "Email", value: shop.email || "—" },
                  { icon: Clock, label: "Operating Hours", value: shop.operatingHours || (shop.openTime && shop.closeTime ? `${shop.openTime} - ${shop.closeTime}` : "—") },
                  { icon: Truck, label: "Delivery Radius", value: shop.deliveryRadius ? `${shop.deliveryRadius} km` : "—" },
                  { icon: Calendar, label: "Joined", value: formatDate(shop.joinedDate || shop.createdAt) },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
                    <item.icon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                      <p className="text-sm font-semibold" style={{ color: "#14261f" }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {shop.description && (
                <div className="mt-4 p-4 rounded-md bg-gray-50">
                  <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                  <p className="text-sm text-gray-600">{shop.description}</p>
                </div>
              )}
              {shop.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {shop.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-[#155c43]/10 text-[#155c43] rounded-full text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                    Products ({shopProducts.length})
                  </h3>
                  <button
                    onClick={() => navigate("/admin/products")}
                    className="text-xs font-semibold text-[#155c43] hover:underline flex items-center gap-1"
                  >
                    View All <ExternalLink size={12} />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopProducts.slice(0, 5).map((product) => (
                      <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                              {product.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: "#14261f" }}>{product.name}</p>
                              <p className="text-xs text-gray-400 font-mono">{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md">
                            {product.category || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right font-semibold" style={{ color: "#14261f" }}>
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                            (product.stock || product.stockQuantity || 0) > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}>
                            {product.stock ?? product.stockQuantity ?? 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {shopProducts.length > 5 && (
                <div className="p-4 text-center border-t border-gray-100">
                  <button
                    onClick={() => navigate("/admin/products")}
                    className="text-sm font-semibold text-[#155c43] hover:underline"
                  >
                    View all {shopProducts.length} products
                  </button>
                </div>
              )}
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                    Recent Orders ({shopOrders.length})
                  </h3>
                  <button
                    onClick={() => navigate("/admin/orders")}
                    className="text-xs font-semibold text-[#155c43] hover:underline flex items-center gap-1"
                  >
                    View All <ExternalLink size={12} />
                  </button>
                </div>
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
                    {shopOrders.slice(0, 5).map((order) => (
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

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                Shop Owner
              </h3>
              {shopkeeper ? (
                <div
                  className="flex items-center gap-3 p-3 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => navigate(`/admin/shopkeepers/${shopkeeper.id}`)}
                >
                  <div className="w-11 h-11 rounded-md bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {shopkeeper.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: "#14261f" }}>{shopkeeper.name}</p>
                    <p className="text-xs text-gray-400">{shopkeeper.email}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400" />
                </div>
              ) : (
                <div className="p-3 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-500">{shop.ownerName || "—"}</p>
                  <p className="text-xs text-gray-400">{shop.email || "—"}</p>
                </div>
              )}
            </motion.div>

            {/* Delivery Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                Delivery Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Delivery Radius</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>
                    {shop.deliveryRadius ? `${shop.deliveryRadius} km` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Minimum Order</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>
                    {shop.minimumOrder ? formatCurrency(shop.minimumOrder) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Avg Delivery Time</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>
                    {shop.averageDeliveryTime ? `${shop.averageDeliveryTime} min` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Delivery Fee</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>
                    {shop.deliveryFee || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Open Now</span>
                  <span className={`text-sm font-semibold ${shop.isOpenNow ? "text-emerald-600" : "text-rose-600"}`}>
                    {shop.isOpenNow ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "#14261f" }}>
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Delivered Orders</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>{deliveredOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Total Revenue</span>
                  <span className="text-sm font-semibold text-[#155c43]">{formatCurrency(revenue)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Avg Rating</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold" style={{ color: "#14261f" }}>{avgRating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Total Ratings</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>
                    {shop.totalRatings ?? shopOrders.filter((o) => o.rating).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">Commission</span>
                  <span className="text-sm font-semibold" style={{ color: "#14261f" }}>
                    {shop.commission ?? 5}%
                  </span>
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
                      shop.status === "active"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {shop.status === "active" ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                      {shop.status === "active" ? "Suspend Shop" : "Activate Shop"}
                    </h3>
                    <p className="text-sm text-gray-500">This action can be reversed later</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to {shop.status === "active" ? "suspend" : "activate"}{" "}
                  <span className="font-semibold">{shop.name}</span>?
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
                      shop.status === "active"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {shop.status === "active" ? "Suspend" : "Activate"}
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
