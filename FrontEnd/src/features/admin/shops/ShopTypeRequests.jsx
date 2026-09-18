import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Store,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const statusOptions = ["All", "pending", "approved", "rejected"];
const statusLabels = { All: "All", pending: "Pending", approved: "Approved", rejected: "Rejected" };
const statusBadge = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
}

export default function ShopTypeRequests() {
  const { shopTypeRequests, approveShopType, rejectShopType } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmModal, setConfirmModal] = useState(null);

  const filteredRequests = useMemo(() => {
    let result = [...shopTypeRequests];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.requestedType?.toLowerCase().includes(q) ||
          r.shopkeeperName?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((r) => r.status === statusFilter);
    }

    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [shopTypeRequests, search, statusFilter]);

  const handleAction = (request, action) => {
    setConfirmModal({ request, action });
  };

  const confirmAction = () => {
    if (!confirmModal) return;
    const { request, action } = confirmModal;
    if (action === "approve") approveShopType(request.id);
    else rejectShopType(request.id);
    setConfirmModal(null);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#14261f" }}>
            Shop Type Requests
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage requests for new shop types on the platform
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: "Pending", value: shopTypeRequests.filter((r) => r.status === "pending").length, color: "bg-amber-50 text-amber-700" },
            { label: "Approved", value: shopTypeRequests.filter((r) => r.status === "approved").length, color: "bg-emerald-50 text-emerald-700" },
            { label: "Rejected", value: shopTypeRequests.filter((r) => r.status === "rejected").length, color: "bg-rose-50 text-rose-700" },
          ].map((stat) => (
            <div key={stat.label} className={`p-4 rounded-md ${stat.color}`}>
              <p className="text-xs font-medium opacity-70">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by type, shopkeeper, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#155c43]/20 focus:border-[#155c43] transition-all"
              />
            </div>
            <div className="flex gap-2">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    statusFilter === s
                      ? "bg-[#155c43] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-12 text-center"
            >
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No shop type requests found</p>
              <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
            </motion.div>
          )}

          {filteredRequests.map((request, idx) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white flex-shrink-0">
                  <Tag size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                        {request.requestedType}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Requested by <span className="font-semibold">{request.shopkeeperName}</span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize flex-shrink-0 ${
                        statusBadge[request.status] || "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">{request.description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeAgo(request.createdAt)}
                    </span>
                    {request.documents?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText size={12} />
                        {request.documents.length} document(s) attached
                      </span>
                    )}
                    {request.rejectionReason && (
                      <span className="flex items-center gap-1 text-rose-500">
                        <AlertTriangle size={12} />
                        {request.rejectionReason}
                      </span>
                    )}
                  </div>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(request, "reject")}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 rounded-md text-xs font-semibold hover:bg-rose-100 transition-colors"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(request, "approve")}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-md text-xs font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Confirm Modal */}
        <AnimatePresence>
          {confirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setConfirmModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-md flex items-center justify-center ${
                      confirmModal.action === "approve"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {confirmModal.action === "approve" ? (
                      <CheckCircle size={24} />
                    ) : (
                      <XCircle size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                      {confirmModal.action === "approve" ? "Approve Request" : "Reject Request"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {confirmModal.action === "approve"
                        ? "The shopkeeper will be able to create this shop type"
                        : "This request will be permanently rejected"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to {confirmModal.action} the request for{" "}
                  <span className="font-semibold">{confirmModal.request?.requestedType}</span>{" "}
                  by <span className="font-semibold">{confirmModal.request?.shopkeeperName}</span>?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAction}
                    className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors ${
                      confirmModal.action === "approve"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {confirmModal.action === "approve" ? "Approve" : "Reject"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
