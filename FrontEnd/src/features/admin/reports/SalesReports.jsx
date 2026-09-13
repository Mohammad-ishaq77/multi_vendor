import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, IndianRupee, ShoppingCart, Truck, Package, Users } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

export default function SalesReports() {
  const { orders, customers, shopkeepers, deliveryPartners } = useAdmin();
  const [timeFilter, setTimeFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    if (timeFilter === "today") {
      const today = new Date().toDateString();
      return orders.filter((o) => new Date(o.orderDate).toDateString() === today);
    }
    if (timeFilter === "7days") {
      const d = new Date(); d.setDate(d.getDate() - 7);
      return orders.filter((o) => new Date(o.orderDate) >= d);
    }
    if (timeFilter === "30days") {
      const d = new Date(); d.setDate(d.getDate() - 30);
      return orders.filter((o) => new Date(o.orderDate) >= d);
    }
    return orders;
  }, [orders, timeFilter]);

  const stats = useMemo(() => ({
    grossSales: filteredOrders.reduce((s, o) => s + o.totalAmount, 0),
    netSales: filteredOrders.reduce((s, o) => s + o.productAmount, 0),
    totalOrders: filteredOrders.length,
    avgOrderValue: filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((s, o) => s + o.totalAmount, 0) / filteredOrders.length) : 0,
    deliveryFees: filteredOrders.reduce((s, o) => s + o.deliveryFee, 0),
    nearmartRevenue: filteredOrders.reduce((s, o) => s + o.platformShare, 0),
    shopkeeperRevenue: filteredOrders.reduce((s, o) => s + o.productAmount, 0),
    partnerEarnings: filteredOrders.reduce((s, o) => s + o.partnerShare, 0),
  }), [filteredOrders]);

  const maxRevenue = Math.max(stats.nearmartRevenue, stats.shopkeeperRevenue, stats.partnerEarnings, 1);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-[#14261f]">Sales Reports</h1><p className="text-sm text-gray-500 mt-1">Revenue analytics and financial breakdown.</p></div>
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white font-semibold"><option value="all">All Time</option><option value="today">Today</option><option value="7days">Last 7 Days</option><option value="30days">Last 30 Days</option></select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Gross Sales", value: `₹${stats.grossSales.toLocaleString("en-IN")}`, color: "from-[#155c43] to-emerald-600", icon: IndianRupee },
            { label: "Total Orders", value: stats.totalOrders, color: "from-blue-500 to-indigo-500", icon: ShoppingCart },
            { label: "Avg Order Value", value: `₹${stats.avgOrderValue.toLocaleString("en-IN")}`, color: "from-amber-500 to-orange-500", icon: TrendingUp },
            { label: "Delivery Fees", value: `₹${stats.deliveryFees.toLocaleString("en-IN")}`, color: "from-violet-500 to-purple-500", icon: Truck },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}><s.icon className="w-5 h-5" /></div>
                <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-sm font-bold text-gray-900">{s.value}</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-5">Revenue Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: "Shopkeeper Revenue", value: stats.shopkeeperRevenue, color: "bg-emerald-500" },
              { label: "NearMart Revenue", value: stats.nearmartRevenue, color: "bg-[#155c43]" },
              { label: "Partner Earnings", value: stats.partnerEarnings, color: "bg-amber-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{item.label}</span><span className="font-bold text-gray-900">₹{item.value.toLocaleString("en-IN")}</span></div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(item.value / maxRevenue) * 100}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full ${item.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Customers", value: customers?.length || 0, icon: Users },
            { label: "Shopkeepers", value: shopkeepers?.length || 0, icon: Users },
            { label: "Delivery Partners", value: deliveryPartners?.length || 0, icon: Truck },
            { label: "Active Orders", value: orders.filter((o) => o.status === "out_for_delivery" || o.status === "ready_for_pickup").length, icon: Package },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
              <s.icon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
