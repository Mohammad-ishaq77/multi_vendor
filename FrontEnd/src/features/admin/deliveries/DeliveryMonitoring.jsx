import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Truck, Clock, Package, CheckCircle, XCircle, MapPin, Filter } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusColors = {
  ready_for_pickup: "bg-blue-50 text-blue-700 border-blue-200",
  out_for_delivery: "bg-amber-50 text-amber-700 border-amber-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusDots = {
  ready_for_pickup: "bg-blue-500",
  out_for_delivery: "bg-amber-500",
  delivered: "bg-emerald-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

export default function DeliveryMonitoring() {
  const navigate = useNavigate();
  const { orders } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const deliveries = useMemo(() => {
    let result = orders.filter((o) => o.status !== "cancelled");
    if (statusFilter !== "all") result = result.filter((o) => o.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.deliveryPartnerName.toLowerCase().includes(q) || o.shopName.toLowerCase().includes(q));
    }
    return result;
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => ({
    active: orders.filter((o) => o.status === "out_for_pickup" || o.status === "out_for_delivery").length,
    waiting: orders.filter((o) => o.status === "ready_for_pickup").length,
    completed: orders.filter((o) => o.status === "delivered" || o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }), [orders]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#14261f]">Delivery Monitoring</h1>
          <p className="text-sm text-gray-500 mt-1">Track and monitor all delivery operations in real-time.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Active", value: stats.active, color: "from-amber-500 to-orange-500", icon: Truck },
            { label: "Waiting for Pickup", value: stats.waiting, color: "from-blue-500 to-indigo-500", icon: Clock },
            { label: "Completed", value: stats.completed, color: "from-emerald-500 to-teal-500", icon: CheckCircle },
            { label: "Cancelled", value: stats.cancelled, color: "from-rose-500 to-pink-500", icon: XCircle },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}><s.icon className="w-5 h-5" /></div>
                <div><p className="text-xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order, customer, partner..." className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-200 text-sm focus:border-[#155c43] focus:ring-2 focus:ring-[#155c43]/10 outline-none transition-all" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-md border border-gray-200 text-sm bg-white focus:border-[#155c43] outline-none">
            <option value="all">All Status</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Order ID</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Shop</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Partner</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Distance</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
              </tr></thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} onClick={() => navigate(`/admin/deliveries/${d.id}`)} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors">
                    <td className="px-5 py-3 font-semibold text-[#155c43]">{d.id}</td>
                    <td className="px-5 py-3 text-gray-700">{d.shopName}</td>
                    <td className="px-5 py-3 text-gray-700">{d.customerName}</td>
                    <td className="px-5 py-3 text-gray-700">{d.deliveryPartnerName}</td>
                    <td className="px-5 py-3 text-gray-500">{d.deliveryDistance} km</td>
                    <td className="px-5 py-3"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[d.status] || ""}`}><span className={`w-1.5 h-1.5 rounded-full ${statusDots[d.status]}`}></span>{d.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span></td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(d.orderDate).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
                {deliveries.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No deliveries found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {deliveries.map((d) => (
            <motion.div key={d.id} whileHover={{ y: -2 }} onClick={() => navigate(`/admin/deliveries/${d.id}`)} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div><p className="text-sm font-bold text-gray-900">{d.id}</p><p className="text-xs text-gray-500">{d.shopName}</p></div>
                <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border ${statusColors[d.status] || ""}`}>{d.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.deliveryDistance} km</span>
                <span>{d.customerName}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
