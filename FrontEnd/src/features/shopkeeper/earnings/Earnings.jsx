import { useState } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";

const Earnings = () => {
  const { earnings } = useShopkeeper();
  const [activeTab, setActiveTab] = useState("all");

  const filteredTxns = earnings.transactions.filter((t) => {
    if (activeTab === "all") return true;
    return t.status.toLowerCase() === activeTab;
  });

  return (
    <ShopkeeperShell>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Earnings</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track your revenue and transactions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Earnings", value: `₹${earnings.total.toLocaleString()}`, icon: IndianRupee, color: "from-emerald-500 to-teal-500", trend: "+12%" },
            { label: "Today's Earnings", value: `₹${earnings.today.toLocaleString()}`, icon: TrendingUp, color: "from-emerald-600 to-teal-500", trend: "+8%" },
            { label: "This Month", value: `₹${earnings.thisMonth.toLocaleString()}`, icon: ArrowUpRight, color: "from-emerald-700 to-emerald-500", trend: "+15%" },
            { label: "Pending Settlement", value: `₹${earnings.pendingSettlement.toLocaleString()}`, icon: Clock, color: "from-amber-500 to-emerald-500" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {stat.trend && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Completed Orders</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{earnings.completedOrders}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Avg. Order Value</p>
            <p className="text-xl font-bold text-gray-900 mt-1">₹{earnings.averageOrderValue}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Last Month</p>
            <p className="text-xl font-bold text-gray-900 mt-1">₹{earnings.lastMonth.toLocaleString()}</p>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Transaction History</h3>
              <div className="flex gap-1">
                {["all", "settled", "pending"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab ? "bg-emerald-600 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredTxns.map((txn, i) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    txn.status === "Settled" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {txn.status === "Settled" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{txn.orderId}</p>
                    <p className="text-xs text-gray-500">{txn.date} &middot; {txn.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{txn.amount}</p>
                  <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full ${
                    txn.status === "Settled" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>{txn.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </ShopkeeperShell>
  );
};

export default Earnings;
