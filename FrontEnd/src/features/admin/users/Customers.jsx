import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  ArrowUpDown,
  X,
  Users,
  Loader2,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";

const STATUS_COLORS = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  suspended: "bg-rose-50 text-rose-700 border border-rose-200",
};

const STATUS_LABELS = { active: "Active", suspended: "Suspended" };
const FILTER_OPTIONS = ["All", "Active", "Suspended"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ConfirmActionModal({ isOpen, onClose, onConfirm, title, message, confirmLabel, loading }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={onConfirm} disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Customers() {
  const navigate = useNavigate();
  const { customers, suspendUser, activateUser } = useAdmin();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, id: null, action: "" });
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = [...customers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
    }
    if (statusFilter !== "All") {
      result = result.filter((u) => u.status === statusFilter.toLowerCase());
    }
    result.sort((a, b) => {
      const da = new Date(a.joinedDate);
      const db = new Date(b.joinedDate);
      return sortOrder === "newest" ? db - da : da - db;
    });
    return result;
  }, [customers, search, statusFilter, sortOrder]);

  const handleAction = (id, action) => setActionModal({ open: true, id, action });

  const confirmAction = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (actionModal.action === "suspend") suspendUser(actionModal.id, "customer");
    else activateUser(actionModal.id, "customer");
    setLoading(false);
    setActionModal({ open: false, id: null, action: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all customer accounts</p>
        </div>
        <span className="text-sm text-gray-500">{filtered.length} customer{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#155c43]/20 focus:border-[#155c43] transition-colors" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-xl transition-colors ${showFilters ? "bg-[#155c43] text-white border-[#155c43]" : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"}`}>
                <Filter className="w-4 h-4" /> Filters
              </button>
              <button onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <ArrowUpDown className="w-4 h-4" /> {sortOrder === "newest" ? "Newest" : "Oldest"}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-2 pt-3">
                  {FILTER_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => setStatusFilter(opt)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === opt ? "bg-[#155c43] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No customers found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Customer</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Phone</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Orders</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Total Spent</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Joined</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, i) => (
                    <motion.tr key={user.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#155c43]/10 flex items-center justify-center text-sm font-semibold text-[#155c43]">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.totalOrders}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">₹{user.totalSpent?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.joinedDate)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status]}`}>
                          {STATUS_LABELS[user.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/admin/users/customer/${user.id}`)}
                            className="p-2 text-gray-400 hover:text-[#155c43] hover:bg-[#155c43]/5 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                          {user.status === "active" ? (
                            <button onClick={() => handleAction(user.id, "suspend")}
                              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Suspend"><UserX className="w-4 h-4" /></button>
                          ) : (
                            <button onClick={() => handleAction(user.id, "activate")}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Activate"><UserCheck className="w-4 h-4" /></button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-gray-100">
              {filtered.map((user, i) => (
                <motion.div key={user.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#155c43]/10 flex items-center justify-center text-sm font-semibold text-[#155c43]">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status]}`}>
                      {STATUS_LABELS[user.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mt-3">
                    <div className="bg-gray-50 rounded-xl p-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-gray-400 mx-auto mb-0.5" />
                      <p className="text-xs font-medium text-gray-900">{user.totalOrders}</p>
                      <p className="text-[10px] text-gray-500">Orders</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-400 mx-auto mb-0.5" />
                      <p className="text-xs font-medium text-gray-900">₹{user.totalSpent?.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">Spent</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-xs font-medium text-gray-900">{formatDate(user.joinedDate)}</p>
                      <p className="text-[10px] text-gray-500">Joined</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    <button onClick={() => navigate(`/admin/users/customer/${user.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    {user.status === "active" ? (
                      <button onClick={() => handleAction(user.id, "suspend")}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                        <UserX className="w-3.5 h-3.5" /> Suspend
                      </button>
                    ) : (
                      <button onClick={() => handleAction(user.id, "activate")}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                        <UserCheck className="w-3.5 h-3.5" /> Activate
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmActionModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, id: null, action: "" })}
        onConfirm={confirmAction}
        title={actionModal.action === "suspend" ? "Suspend Customer" : "Activate Customer"}
        message={actionModal.action === "suspend" ? "This customer will no longer be able to place orders. Are you sure?" : "This customer will be reactivated and can place orders again."}
        confirmLabel={actionModal.action === "suspend" ? "Suspend" : "Activate"}
        loading={loading}
      />
    </div>
  );
}
