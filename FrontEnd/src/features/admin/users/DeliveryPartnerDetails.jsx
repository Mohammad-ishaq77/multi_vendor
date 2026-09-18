import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, Phone, Calendar, Truck, Car, Star, IndianRupee,
  Package, UserCheck, UserX, Loader2, AlertCircle, MapPin, TrendingUp, CheckCircle2,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function DeliveryPartnerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deliveryPartners, orders } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");

  const partner = useMemo(() => deliveryPartners.find((p) => p.id === id), [deliveryPartners, id]);
  const partnerDeliveries = useMemo(
    () => orders.filter((o) => o.deliveryPartnerId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, id]
  );

  if (!partner) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Delivery partner not found</p>
        <button onClick={() => navigate("/admin/users")} className="mt-4 text-sm text-[#155c43] font-medium hover:underline">Back to users</button>
      </div>
    );
  }

  const stats = [
    { label: "Total Deliveries", value: partner.totalDeliveries, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Earnings", value: "₹" + partner.earnings?.toLocaleString(), icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Rating", value: partner.rating, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "On-Time %", value: "96%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const handleAction = () => setShowConfirm(true);

  const executeAction = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/users")} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Partner Profile</h1>
          <p className="text-sm text-gray-500 mt-1">ID: {partner.id}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${partner.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {partner.status === "active" ? "Active" : "Inactive"}
        </span>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#155c43]/10 flex items-center justify-center text-xl font-bold text-[#155c43]">{partner.name.charAt(0)}</div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{partner.name}</h2>
            <p className="text-sm text-gray-500">{partner.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900">{partner.email}</p></div></div>
          <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium text-gray-900">{partner.phone}</p></div></div>
          <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Joined</p><p className="text-sm font-medium text-gray-900">{formatDate(partner.joinedDate)}</p></div></div>
          <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Available</p><p className="text-sm font-medium text-gray-900">{partner.isAvailable ? "Yes" : "No"}</p></div></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.1 }}
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-md ${stat.bg} flex items-center justify-center`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-[#155c43]" /> Vehicle Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3"><Truck className="w-4 h-4 text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-500">Vehicle Type</p><p className="text-sm font-medium text-gray-900">{partner.vehicleType}</p></div></div>
            <div className="flex items-start gap-3"><Car className="w-4 h-4 text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-500">Vehicle Number</p><p className="text-sm font-medium text-gray-900">{partner.vehicleNumber}</p></div></div>
            <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-500">Current Location</p><p className="text-sm font-medium text-gray-900">{partner.currentLocation ? `${partner.currentLocation.lat}, ${partner.currentLocation.lng}` : "—"}</p></div></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#155c43]" /> Performance
          </h3>
          <div className="space-y-3">
            {[
              { label: "On-Time Delivery", value: "96%", ok: true },
              { label: "Customer Rating", value: partner.rating + "/5.0", ok: partner.rating >= 4 },
              { label: "Acceptance Rate", value: "89%", ok: true },
              { label: "Cancellation Rate", value: "3%", ok: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  <CheckCircle2 className={`w-4 h-4 ${item.ok ? "text-emerald-500" : "text-amber-500"}`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#155c43]" /> Recent Deliveries
        </h3>
        {partnerDeliveries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No deliveries yet</p>
        ) : (
          <div className="space-y-3">
            {partnerDeliveries.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customerName} &middot; {order.shopName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{order.totalAmount}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.deliveredAt || order.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Actions</h3>
        {partner.status === "active" ? (
          <button onClick={() => { setConfirmAction("suspend"); handleAction(); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors">
            <UserX className="w-4 h-4" /> Deactivate Account
          </button>
        ) : (
          <button onClick={() => { setConfirmAction("activate"); handleAction(); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors">
            <UserCheck className="w-4 h-4" /> Activate Account
          </button>
        )}
      </motion.div>

      {showConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirmAction === "suspend" ? "Deactivate Partner" : "Activate Partner"}</h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmAction === "suspend" ? "This partner will be deactivated and cannot accept deliveries. Are you sure?" : "This partner will be reactivated and can accept deliveries again."}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={executeAction} disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 ${confirmAction === "suspend" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmAction === "suspend" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
