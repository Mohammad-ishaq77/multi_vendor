import { IndianRupee, TrendingUp, Truck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function Earnings() {
  const navigate = useNavigate();
  const { earnings } = useDeliveryPartner();

  const maxAmount = Math.max(...earnings.weeklyBreakdown.map((d) => d.amount));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-sm text-gray-500 mt-1">Track your delivery earnings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <IndianRupee className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-400">Today</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{earnings.today}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-400">This Week</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{earnings.thisWeek}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-200">
              <IndianRupee className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-400">This Month</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{earnings.thisMonth}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <p className="text-xs text-emerald-100">Total Earnings</p>
          </div>
          <p className="text-2xl font-bold">₹{earnings.total}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{earnings.totalDeliveries}</p>
              <p className="text-xs text-gray-400">Total Deliveries</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">₹{earnings.averagePerDelivery.toFixed(0)}</p>
              <p className="text-xs text-gray-400">Avg per Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-4">This Week</h2>
        <div className="flex items-end justify-between gap-2 h-40">
          {earnings.weeklyBreakdown.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[0.6rem] font-semibold text-gray-500">₹{day.amount}</span>
              <div className="w-full rounded-t-lg bg-emerald-100 relative" style={{ height: `${(day.amount / maxAmount) * 100}%` }}>
                <div className="absolute inset-x-0 bottom-0 rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400" style={{ height: "100%" }} />
              </div>
              <span className="text-[0.65rem] text-gray-400 font-medium">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Recent Transactions</h2>
          <button onClick={() => navigate("/deliverypartner/earnings/recent")} className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {earnings.recentTransactions.slice(0, 5).map((txn) => (
            <div key={txn.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{txn.orderId}</p>
                <p className="text-xs text-gray-400">{txn.date} · {txn.distance} km</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">₹{txn.partnerEarning}</p>
                <p className="text-[0.6rem] text-gray-400">Fee ₹{txn.deliveryFee} · {txn.partnerPercentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
