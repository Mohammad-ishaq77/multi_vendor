import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, Store, Star,
  IndianRupee, ShoppingBag, Package, UserCheck, UserX, Loader2, AlertCircle, TrendingUp,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ShopkeeperDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { shopkeepers, shops, products, orders, suspendUser, activateUser } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");

  const shopkeeper = useMemo(() => shopkeepers.find((s) => s.id === id), [shopkeepers, id]);
  const shop = useMemo(() => shops.find((s) => s.ownerId === id), [shops, id]);
  const shopProducts = useMemo(() => products.filter((p) => p.shopId === shop?.id), [products, shop]);
  const shopOrders = useMemo(
    () => orders.filter((o) => o.shopId === shop?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, shop]
  );

  if (!shopkeeper) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Shopkeeper not found</p>
        <button onClick={() => navigate("/admin/users")} className="mt-4 text-sm text-[#155c43] font-medium hover:underline">Back to users</button>
      </div>
    );
  }

  const totalRevenue = shopOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = shopOrders.length > 0 ? Math.round(totalRevenue / shopOrders.length) : 0;

  const handleAction = () => setShowConfirm(true);

  const executeAction = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (confirmAction === "suspend") suspendUser(shopkeeper.id, "shopkeeper");
    else activateUser(shopkeeper.id, "shopkeeper");
    setLoading(false);
    setShowConfirm(false);
  };

  const stats = [
    { label: "Total Orders", value: shopOrders.length, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Revenue", value: "₹" + totalRevenue.toLocaleString(), icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Avg Order", value: "₹" + avgOrderValue.toLocaleString(), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Products", value: shopProducts.length, icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/users")} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Shopkeeper Profile</h1>
          <p className="text-sm text-gray-500 mt-1">ID: {shopkeeper.id}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${shopkeeper.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {shopkeeper.status === "active" ? "Active" : "Suspended"}
        </span>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#155c43]/10 flex items-center justify-center text-xl font-bold text-[#155c43]">{shopkeeper.name.charAt(0)}</div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{shopkeeper.name}</h2>
            <p className="text-sm text-gray-500">{shopkeeper.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900">{shopkeeper.email}</p></div></div>
          <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium text-gray-900">{shopkeeper.phone}</p></div></div>
          <div className="flex items-center gap-3"><Store className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Shop</p><p className="text-sm font-medium text-gray-900">{shopkeeper.shopName || "—"}</p></div></div>
          <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Joined</p><p className="text-sm font-medium text-gray-900">{formatDate(shopkeeper.joinedDate)}</p></div></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {shop && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#155c43]" /> Shop Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><p className="text-xs text-gray-500">Shop Name</p><p className="text-sm font-medium text-gray-900">{shop.name}</p></div>
            <div><p className="text-xs text-gray-500">Type</p><p className="text-sm font-medium text-gray-900">{shop.type}</p></div>
            <div><p className="text-xs text-gray-500">Address</p><p className="text-sm font-medium text-gray-900">{shop.address}</p></div>
            <div><p className="text-xs text-gray-500">Rating</p>
              <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-sm font-medium text-gray-900">{shop.rating}</span></div>
            </div>
            <div><p className="text-xs text-gray-500">Products</p><p className="text-sm font-medium text-gray-900">{shop.totalProducts}</p></div>
            <div><p className="text-xs text-gray-500">Commission</p><p className="text-sm font-medium text-gray-900">{shop.commission}%</p></div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#155c43]" /> Recent Orders
        </h3>
        {shopOrders.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {shopOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customerName} &middot; {formatDate(order.createdAt)}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">₹{order.totalAmount}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Actions</h3>
        {shopkeeper.status === "active" ? (
          <button onClick={() => { setConfirmAction("suspend"); handleAction(); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors">
            <UserX className="w-4 h-4" /> Suspend Account
          </button>
        ) : (
          <button onClick={() => { setConfirmAction("activate"); handleAction(); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
            <UserCheck className="w-4 h-4" /> Activate Account
          </button>
        )}
      </motion.div>

      {showConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirmAction === "suspend" ? "Suspend Shopkeeper" : "Activate Shopkeeper"}</h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmAction === "suspend" ? "This shopkeeper will be suspended and their shop deactivated. Are you sure?" : "This shopkeeper will be reactivated and their shop will be available again."}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={executeAction} disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2 ${confirmAction === "suspend" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmAction === "suspend" ? "Suspend" : "Activate"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
