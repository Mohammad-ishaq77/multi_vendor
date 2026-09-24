import { useMemo } from "react";
import { motion } from "framer-motion";
import { Truck, CheckCircle, XCircle, Clock, MapPin } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

export default function DeliveryReports() {
  const { orders } = useAdmin();

  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status === "delivered" || o.status === "completed");
    const cancelled = orders.filter((o) => o.status === "cancelled");
    const active = orders.filter((o) => o.status === "out_for_delivery" || o.status === "ready_for_pickup");
    const avgDistance = completed.length > 0 ? (completed.reduce((s, o) => s + (o.deliveryDistance || 0), 0) / completed.length).toFixed(1) : 0;
    const avgTime = completed.length > 0 ? Math.round(completed.reduce((s, o) => s + (o.deliveryTime || 0), 0) / completed.length) : 0;
    return { total: orders.length, completed: completed.length, cancelled: cancelled.length, active: active.length, avgDistance, avgTime };
  }, [orders]);

  const partnerPerformance = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (!o.deliveryPartnerId || !o.deliveryPartnerName) return;
      if (!map[o.deliveryPartnerId]) map[o.deliveryPartnerId] = { id: o.deliveryPartnerId, name: o.deliveryPartnerName, deliveries: 0, earnings: 0, rating: 0, ratings: [] };
      map[o.deliveryPartnerId].deliveries++;
      map[o.deliveryPartnerId].earnings += o.partnerShare || 0;
      if (o.customerRating) map[o.deliveryPartnerId].ratings.push(o.customerRating);
    });
    return Object.values(map).map((p) => ({ ...p, rating: p.ratings.length > 0 ? (p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length).toFixed(1) : "—" })).sort((a, b) => b.deliveries - a.deliveries).slice(0, 8);
  }, [orders]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-[#14261f]">Delivery Reports</h1><p className="text-sm text-gray-500 mt-1">Delivery performance analytics and partner metrics.</p></div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Total Deliveries", value: stats.total, color: "from-gray-500 to-gray-600", icon: Truck },
            { label: "Completed", value: stats.completed, color: "from-emerald-500 to-teal-500", icon: CheckCircle },
            { label: "Active", value: stats.active, color: "from-amber-500 to-orange-500", icon: Clock },
            { label: "Cancelled", value: stats.cancelled, color: "from-rose-500 to-pink-500", icon: XCircle },
            { label: "Avg Distance", value: `${stats.avgDistance} km`, color: "from-blue-500 to-indigo-500", icon: MapPin },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}><s.icon className="w-5 h-5" /></div>
                <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-lg font-bold text-gray-900">{s.value}</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Delivery Status Breakdown</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Completed", value: stats.completed, color: "bg-emerald-500" },
              { label: "Active", value: stats.active, color: "bg-amber-500" },
              { label: "Cancelled", value: stats.cancelled, color: "bg-rose-500" },
              { label: "Other", value: stats.total - stats.completed - stats.active - stats.cancelled, color: "bg-gray-400" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="h-24 bg-gray-50 rounded-md relative overflow-hidden mb-2">
                  <div className={`${s.color} absolute bottom-0 left-0 right-0 rounded-b-xl transition-all duration-1000`} style={{ height: `${stats.total > 0 ? (s.value / stats.total) * 100 : 0}%` }} />
                </div>
                <p className="text-sm font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Partner Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">Partner Performance</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Partner</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">Deliveries</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Earnings</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">Rating</th>
              </tr></thead>
              <tbody>
                {partnerPerformance.map((p, i) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{i + 1}. {p.name}</td>
                    <td className="px-5 py-3 text-center font-semibold">{p.deliveries}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#155c43]">₹{p.earnings.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${p.rating !== "—" && Number(p.rating) >= 4 ? "bg-emerald-50 text-emerald-700" : p.rating !== "—" && Number(p.rating) >= 3 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                        ★ {p.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
