import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, CreditCard, IndianRupee, CheckCircle, Clock, XCircle, RotateCcw } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusColors = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  refunded: "bg-teal-50 text-teal-700 border-teal-200",
};

const statusIcons = { paid: CheckCircle, pending: Clock, failed: XCircle, refunded: RotateCcw };

export default function Payments() {
  const navigate = useNavigate();
  const { orders } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const payments = useMemo(() => {
    let result = orders.map((o) => ({
      orderId: o.id,
      customerName: o.customerName,
      shopName: o.shopName,
      productAmount: o.productAmount ?? o.totalAmount ?? 0,
      deliveryFee: o.deliveryFee || 0,
      totalAmount: o.totalAmount ?? ((o.productAmount || 0) + (o.deliveryFee || 0)),
      paymentMethod: o.paymentMethod,
      paymentStatus: (o.paymentStatus || "paid").toLowerCase() === "paid" ? "paid" : (o.paymentStatus || "pending").toLowerCase(),
      orderDate: o.orderDate || o.createdAt,
      partnerShare: o.partnerShare,
      platformShare: o.platformShare,
    }));
    if (statusFilter !== "all") result = result.filter((p) => p.paymentStatus === statusFilter);
    if (methodFilter !== "all") result = result.filter((p) => String(p.paymentMethod || "").toLowerCase().includes(methodFilter));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.orderId.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q) || p.shopName.toLowerCase().includes(q));
    }
    return result;
  }, [orders, search, statusFilter, methodFilter]);

  const stats = useMemo(() => ({
    total: orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
    paid: orders.filter((o) => ["paid", "Paid"].includes(o.paymentStatus || "paid")).reduce((s, o) => s + (o.totalAmount || 0), 0),
    pending: orders.filter((o) => String(o.paymentStatus || "").toLowerCase().includes("pending")).reduce((s, o) => s + (o.totalAmount || 0), 0),
    refunded: orders.filter((o) => String(o.paymentStatus || "").toLowerCase() === "refunded").reduce((s, o) => s + (o.totalAmount || 0), 0),
  }), [orders]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#14261f]">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track all financial transactions across the platform.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Revenue", value: `₹${stats.total.toLocaleString("en-IN")}`, icon: IndianRupee, color: "from-[#155c43] to-emerald-600" },
            { label: "Paid", value: `₹${stats.paid.toLocaleString("en-IN")}`, icon: CheckCircle, color: "from-emerald-500 to-teal-500" },
            { label: "Pending", value: `₹${stats.pending.toLocaleString("en-IN")}`, icon: Clock, color: "from-amber-500 to-orange-500" },
            { label: "Refunded", value: `₹${stats.refunded.toLocaleString("en-IN")}`, icon: RotateCcw, color: "from-teal-500 to-emerald-500" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}><s.icon className="w-5 h-5" /></div>
                <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-sm font-bold text-gray-900">{s.value}</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order, customer, shop..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#155c43] outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
            <option value="all">All Methods</option>
            <option value="cod">COD</option>
            <option value="online">Online</option>
            <option value="upi">UPI</option>
            <option value="razorpay">Razorpay</option>
          </select>
        </div>

        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Order ID</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Shop</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Delivery</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Method</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
              </tr></thead>
              <tbody>
                {payments.map((p) => {
                  const StatusIcon = statusIcons[p.paymentStatus] || CheckCircle;
                  return (
                    <tr key={p.orderId} onClick={() => navigate(`/admin/payments/${p.orderId}`)} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors">
                      <td className="px-5 py-3 font-semibold text-[#155c43]">{p.orderId}</td>
                      <td className="px-5 py-3 text-gray-700">{p.customerName}</td>
                      <td className="px-5 py-3 text-gray-700">{p.shopName}</td>
                      <td className="px-5 py-3 text-right text-gray-900 font-medium">₹{p.productAmount}</td>
                      <td className="px-5 py-3 text-right text-gray-500">₹{p.deliveryFee}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-900">₹{p.totalAmount}</td>
                      <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{p.paymentMethod}</span></td>
                      <td className="px-5 py-3"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[p.paymentStatus] || ""}`}><StatusIcon className="w-3 h-3" />{p.paymentStatus}</span></td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{new Date(p.orderDate).toLocaleDateString("en-IN")}</td>
                    </tr>
                  );
                })}
                {payments.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-gray-400 text-sm">No payments found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden space-y-3">
          {payments.map((p) => (
            <motion.div key={p.orderId} whileHover={{ y: -2 }} onClick={() => navigate(`/admin/payments/${p.orderId}`)} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div><p className="text-sm font-bold text-gray-900">{p.orderId}</p><p className="text-xs text-gray-500">{p.customerName}</p></div>
                <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border ${statusColors[p.paymentStatus] || ""}`}>{p.paymentStatus}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{p.shopName}</span>
                <span className="font-bold text-[#155c43]">₹{p.totalAmount}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
