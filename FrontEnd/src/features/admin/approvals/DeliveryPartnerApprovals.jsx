import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Truck,
  ArrowUpDown,
  X,
  Loader2,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200",
  changes_requested: "bg-blue-50 text-blue-700 border border-blue-200",
};

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes Requested",
};

const FILTER_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Changes Requested"];

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

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmLabel, confirmColor, loading }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmColor === "red" ? "bg-rose-50" : "bg-emerald-50"}`}>
              {confirmColor === "red" ? <XCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 ${
                confirmColor === "red" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function RejectModal({ isOpen, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Provide a reason for rejection.</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason..."
            rows={3}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { if (reason.trim()) { onConfirm(reason.trim()); setReason(""); } }}
              disabled={!reason.trim() || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Reject
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ChangesModal({ isOpen, onClose, onConfirm, loading }) {
  const [message, setMessage] = useState("");
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Request Changes</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Describe what changes are needed.</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe required changes..."
            rows={3}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { if (message.trim()) { onConfirm(message.trim()); setMessage(""); } }}
              disabled={!message.trim() || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function DeliveryPartnerApprovals() {
  const navigate = useNavigate();
  const { approvals, approveDeliveryPartner, rejectDeliveryPartner, requestDeliveryPartnerChanges } = useAdmin();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, action: "" });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [changesModal, setChangesModal] = useState({ open: false, id: null });
  const [loading, setLoading] = useState(false);

  const dpApprovals = useMemo(
    () => approvals.filter((a) => a.type === "delivery_partner"),
    [approvals]
  );

  const filtered = useMemo(() => {
    let result = [...dpApprovals];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.applicantName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.includes(q)
      );
    }

    if (statusFilter !== "All") {
      const filterKey = statusFilter.toLowerCase().replace(" ", "_");
      result = result.filter((a) => a.status === filterKey);
    }

    result.sort((a, b) => {
      const da = new Date(a.appliedAt);
      const db = new Date(b.appliedAt);
      return sortOrder === "newest" ? db - da : da - db;
    });

    return result;
  }, [dpApprovals, search, statusFilter, sortOrder]);

  const handleApprove = (id) => setConfirmModal({ open: true, id, action: "approve" });
  const handleReject = (id) => setRejectModal({ open: true, id });
  const handleRequestChanges = (id) => setChangesModal({ open: true, id });

  const confirmApprove = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    approveDeliveryPartner(confirmModal.id);
    setLoading(false);
    setConfirmModal({ open: false, id: null, action: "" });
  };

  const confirmReject = async (reason) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    rejectDeliveryPartner(rejectModal.id, reason);
    setLoading(false);
    setRejectModal({ open: false, id: null });
  };

  const confirmChanges = async (message) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    requestDeliveryPartnerChanges(changesModal.id, message);
    setLoading(false);
    setChangesModal({ open: false, id: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Partner Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage delivery partner applications</p>
        </div>
        <span className="text-sm text-gray-500">
          {filtered.length} application{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#155c43]/20 focus:border-[#155c43] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-md transition-colors ${
                  showFilters ? "bg-[#155c43] text-white border-[#155c43]" : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === "newest" ? "Newest" : "Oldest"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3">
                  {FILTER_OPTIONS.map((opt) => {
                    const isActive = statusFilter === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setStatusFilter(opt)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          isActive ? "bg-[#155c43] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No delivery partner applications found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Applicant</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Phone</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Vehicle</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Applied</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app, i) => (
                    <motion.tr
                      key={app.id}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{app.applicantName}</p>
                          <p className="text-xs text-gray-500">{app.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{app.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{app.vehicleType}</p>
                          <p className="text-xs text-gray-500">{app.vehicleNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDate(app.appliedAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                          {STATUS_LABELS[app.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/admin/approvals/delivery-partners/${app.id}`)}
                            className="p-2 text-gray-400 hover:text-[#155c43] hover:bg-[#155c43]/5 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {app.status === "pending" && (
                            <>
                              <button onClick={() => handleApprove(app.id)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleReject(app.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleRequestChanges(app.id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((app, i) => (
                <motion.div key={app.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{app.applicantName}</p>
                      <p className="text-xs text-gray-500">{app.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                      {STATUS_LABELS[app.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <p>Vehicle: {app.vehicleType} ({app.vehicleNumber})</p>
                    <p>Applied: {formatDate(app.appliedAt)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/admin/approvals/delivery-partners/${app.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    {app.status === "pending" && (
                      <>
                        <button onClick={() => handleApprove(app.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => handleReject(app.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button onClick={() => handleRequestChanges(app.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" /> Changes
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null, action: "" })}
        onConfirm={confirmApprove}
        title="Approve Delivery Partner"
        message="This will approve the delivery partner application. They will be notified and can start accepting deliveries."
        confirmLabel="Approve"
        confirmColor="green"
        loading={loading}
      />
      <RejectModal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, id: null })} onConfirm={confirmReject} loading={loading} />
      <ChangesModal isOpen={changesModal.open} onClose={() => setChangesModal({ open: false, id: null })} onConfirm={confirmChanges} loading={loading} />
    </div>
  );
}
