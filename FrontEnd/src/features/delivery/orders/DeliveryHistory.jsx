import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Package, MapPin, Clock, IndianRupee, ChevronRight } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function DeliveryHistory() {
  const navigate = useNavigate();
  const { deliveryHistory } = useDeliveryPartner();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = deliveryHistory.filter((d) => {
    const matchesSearch = d.id.toLowerCase().includes(search.toLowerCase()) || d.customerName.toLowerCase().includes(search.toLowerCase()) || d.shopName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
        <p className="text-sm text-gray-500 mt-1">{deliveryHistory.length} total deliveries</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID, shop, or customer..." className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-500">No deliveries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <motion.div key={d.id} whileHover={{ y: -1 }} className="bg-white rounded-md border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => navigate(`/delivery/order/${d.id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{d.id}</p>
                    <p className="text-xs text-gray-400">{d.shopName} → {d.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-emerald-600">₹{d.partnerEarning}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 justify-end">
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{d.distance} km</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{d.completedAt ? new Date(d.completedAt).toLocaleDateString() : "—"}</span>
                <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />₹{d.orderAmount}</span>
                <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-semibold ${d.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  {d.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
