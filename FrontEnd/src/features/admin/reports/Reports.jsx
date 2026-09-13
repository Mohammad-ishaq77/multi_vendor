import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Eye, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const priorityColors = { low: "bg-blue-50 text-blue-700 border-blue-200", medium: "bg-amber-50 text-amber-700 border-amber-200", high: "bg-orange-50 text-orange-700 border-orange-200", critical: "bg-rose-50 text-rose-700 border-rose-200" };
const statusColors = { open: "bg-rose-50 text-rose-700 border-rose-200", under_review: "bg-amber-50 text-amber-700 border-amber-200", resolved: "bg-emerald-50 text-emerald-700 border-emerald-200", rejected: "bg-gray-50 text-gray-500 border-gray-200" };

export default function Reports() {
  const { reports, resolveReport, rejectReport } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = useMemo(() => {
    let result = reports || [];
    if (statusFilter !== "all") result = result.filter((r) => r.status === statusFilter);
    if (categoryFilter !== "all") result = result.filter((r) => r.category === categoryFilter);
    if (priorityFilter !== "all") result = result.filter((r) => r.priority === priorityFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.id.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.reportedBy.toLowerCase().includes(q));
    }
    return result;
  }, [reports, search, statusFilter, categoryFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total: reports?.length || 0,
    open: reports?.filter((r) => r.status === "open").length || 0,
    under_review: reports?.filter((r) => r.status === "under_review").length || 0,
    resolved: reports?.filter((r) => r.status === "resolved").length || 0,
  }), [reports]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-[#14261f]">Reports</h1><p className="text-sm text-gray-500 mt-1">Manage and resolve customer and partner reports.</p></div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Reports", value: stats.total, color: "from-gray-500 to-gray-600", icon: AlertTriangle },
            { label: "Open", value: stats.open, color: "from-rose-500 to-pink-500", icon: XCircle },
            { label: "Under Review", value: stats.under_review, color: "from-amber-500 to-orange-500", icon: Clock },
            { label: "Resolved", value: stats.resolved, color: "from-emerald-500 to-teal-500", icon: CheckCircle },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}><s.icon className="w-5 h-5" /></div>
                <div><p className="text-xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"><option value="all">All Status</option><option value="open">Open</option><option value="under_review">Under Review</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option></select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"><option value="all">All Categories</option><option value="Late Delivery">Late Delivery</option><option value="Wrong Item">Wrong Item</option><option value="Quality Issue">Quality Issue</option><option value="Complaint">Complaint</option><option value="Payment Issue">Payment Issue</option></select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"><option value="all">All Priority</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
        </div>

        <div className="space-y-3">
          {filtered.map((report) => (
            <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600"><AlertTriangle className="w-4 h-4" /></div>
                  <div><p className="text-sm font-bold text-gray-900">{report.id}</p><p className="text-xs text-gray-500">Reported by {report.reportedBy}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border ${priorityColors[report.priority] || ""}`}>{report.priority}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border ${statusColors[report.status] || ""}`}>{report.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{report.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{report.category} · {new Date(report.date).toLocaleDateString("en-IN")}</span>
                {report.status === "open" && (
                  <div className="flex gap-2">
                    <button onClick={() => resolveReport(report.id)} className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">Resolve</button>
                    <button onClick={() => rejectReport(report.id)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">Reject</button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <div className="text-center py-16"><AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400">No reports found.</p></div>}
        </div>
      </div>
    </PageTransition>
  );
}
