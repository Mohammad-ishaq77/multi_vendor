import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Store, Truck, TrendingUp } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

export default function UserReports() {
  const { customers, shopkeepers, deliveryPartners } = useAdmin();

  const stats = useMemo(() => ({
    totalCustomers: customers?.length || 0,
    activeCustomers: customers?.filter((c) => c.status === "active").length || 0,
    suspendedCustomers: customers?.filter((c) => c.status === "suspended").length || 0,
    totalShopkeepers: shopkeepers?.length || 0,
    activeShopkeepers: shopkeepers?.filter((s) => s.status === "active").length || 0,
    totalPartners: deliveryPartners?.length || 0,
    activePartners: deliveryPartners?.filter((p) => p.status === "active").length || 0,
  }), [customers, shopkeepers, deliveryPartners]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-[#14261f]">User Reports</h1><p className="text-sm text-gray-500 mt-1">User analytics and platform growth metrics.</p></div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Customers", value: stats.totalCustomers, color: "from-violet-500 to-purple-500", icon: Users },
            { label: "Active Customers", value: stats.activeCustomers, color: "from-emerald-500 to-teal-500", icon: UserCheck },
            { label: "Total Shopkeepers", value: stats.totalShopkeepers, color: "from-blue-500 to-indigo-500", icon: Store },
            { label: "Total Partners", value: stats.totalPartners, color: "from-amber-500 to-orange-500", icon: Truck },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}><s.icon className="w-5 h-5" /></div>
                <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900">{s.value}</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* User Type Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { title: "Customers", total: stats.totalCustomers, active: stats.activeCustomers, suspended: stats.suspendedCustomers, color: "from-violet-500 to-purple-500" },
            { title: "Shopkeepers", total: stats.totalShopkeepers, active: stats.activeShopkeepers, suspended: stats.totalShopkeepers - stats.activeShopkeepers, color: "from-blue-500 to-indigo-500" },
            { title: "Delivery Partners", total: stats.totalPartners, active: stats.activePartners, suspended: stats.totalPartners - stats.activePartners, color: "from-amber-500 to-orange-500" },
          ].map((group) => (
            <motion.div key={group.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${group.color} flex items-center justify-center text-white`}><Users className="w-5 h-5" /></div>
                <div><p className="text-sm font-bold text-gray-900">{group.title}</p><p className="text-xs text-gray-500">{group.total} total</p></div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-emerald-600">Active</span><span className="font-semibold">{group.active} ({group.total > 0 ? Math.round((group.active / group.total) * 100) : 0}%)</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${group.total > 0 ? (group.active / group.total) * 100 : 0}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-rose-600">Suspended</span><span className="font-semibold">{group.suspended} ({group.total > 0 ? Math.round((group.suspended / group.total) * 100) : 0}%)</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500 rounded-full" style={{ width: `${group.total > 0 ? (group.suspended / group.total) * 100 : 0}%` }} /></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {[
              ...(customers || []).slice(-5).map((c) => ({ ...c, type: "Customer" })),
              ...(shopkeepers || []).slice(-3).map((s) => ({ ...s, type: "Shopkeeper" })),
            ].sort((a, b) => new Date(b.joinDate || b.registeredAt || 0) - new Date(a.joinDate || a.registeredAt || 0)).slice(0, 8).map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold">{user.name?.charAt(0)}</div>
                <div className="flex-1"><p className="text-sm font-medium text-gray-900">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></div>
                <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-semibold bg-gray-200 text-gray-600">{user.type}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
