import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Truck,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  Shield,
  Car,
  AlertCircle,
  Clock,
  BadgeCheck,
  ShieldCheck,
  Eye,
  X,
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

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel, confirmColor, loading }) {
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
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
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2 ${
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center"><XCircle className="w-5 h-5 text-rose-600" /></div>
            <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Provide a reason for rejection.</p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason..." rows={3}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none" />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={() => { if (reason.trim()) { onConfirm(reason.trim()); setReason(""); } }} disabled={!reason.trim() || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Reject
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-blue-600" /></div>
            <h3 className="text-lg font-semibold text-gray-900">Request Changes</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Describe what changes are needed.</p>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe required changes..." rows={3}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={() => { if (message.trim()) { onConfirm(message.trim()); setMessage(""); } }} disabled={!message.trim() || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Send
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DocumentViewerModal({ isOpen, onClose, docType, applicantName }) {
  if (!isOpen) return null;

  const DOC_CONTENT = {
    aadhaar: {
      title: "Aadhaar Card",
      fields: [
        { label: "Name", value: applicantName },
        { label: "DOB", value: "01/01/1995" },
        { label: "Aadhaar No.", value: "XXXX XXXX 5678" },
        { label: "Address", value: "DigiLocker Verified Address" },
      ],
    },
    driving_license: {
      title: "Driving License",
      fields: [
        { label: "Name", value: applicantName },
        { label: "DL No.", value: "MH-12-2024-0045678" },
        { label: "Valid From", value: "01/03/2022" },
        { label: "Valid Until", value: "28/02/2032" },
        { label: "Vehicle Class", value: "LMV / Two Wheeler" },
      ],
    },
    rc: {
      title: "Vehicle RC",
      fields: [
        { label: "Owner", value: applicantName },
        { label: "Registration No.", value: "MH-12-XX-1234" },
        { label: "Vehicle Class", value: "Motor Cycle" },
        { label: "Fitness Valid Until", value: "15/08/2027" },
      ],
    },
    address_proof: {
      title: "Address Proof (DigiLocker)",
      fields: [
        { label: "Name", value: applicantName },
        { label: "Address", value: "DigiLocker Verified Residential Address" },
        { label: "PIN Code", value: "411001" },
        { label: "Verified Source", value: "Aadhaar (UIDAI)" },
      ],
    },
  };

  const doc = DOC_CONTENT[docType] || DOC_CONTENT.aadhaar;

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#155c43]/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#155c43]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{doc.title}</h3>
                <p className="text-xs text-gray-500">Fetched via DigiLocker</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {doc.fields.map((field, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{field.label}</span>
                  <span className="text-sm font-medium text-gray-900">{field.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified & authenticated via DigiLocker</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function DeliveryPartnerApprovalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { approvals, approveDeliveryPartner, rejectDeliveryPartner, requestDeliveryPartnerChanges } = useAdmin();

  const [confirmModal, setConfirmModal] = useState({ open: false, action: "" });
  const [rejectModal, setRejectModal] = useState(false);
  const [changesModal, setChangesModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  const approval = useMemo(() => approvals.find((a) => a.id === id), [approvals, id]);

  if (!approval) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Application not found</p>
        <button onClick={() => navigate("/admin/approvals")} className="mt-4 text-sm text-[#155c43] font-medium hover:underline">Back to approvals</button>
      </div>
    );
  }

  const handleApprove = () => setConfirmModal({ open: true, action: "approve" });
  const handleReject = () => setRejectModal(true);
  const handleChanges = () => setChangesModal(true);

  const confirmApprove = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    approveDeliveryPartner(approval.id);
    setLoading(false);
    setConfirmModal({ open: false, action: "" });
    navigate("/admin/approvals");
  };

  const confirmReject = async (reason) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    rejectDeliveryPartner(approval.id, reason);
    setLoading(false);
    setRejectModal(false);
    navigate("/admin/approvals");
  };

  const confirmChanges = async (message) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    requestDeliveryPartnerChanges(approval.id, message);
    setLoading(false);
    setChangesModal(false);
    navigate("/admin/approvals");
  };

  const timeline = [
    { date: approval.appliedAt, label: "Application submitted", done: true },
    { date: approval.status === "approved" ? new Date().toISOString() : null, label: "Documents verified", done: ["approved", "rejected", "changes_requested"].includes(approval.status) },
    { date: null, label: "Background check", done: approval.status === "approved" },
    { date: null, label: "Account activated", done: approval.status === "approved" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/approvals")} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Partner Application</h1>
          <p className="text-sm text-gray-500 mt-1">Application ID: {approval.id}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[approval.status]}`}>
          {STATUS_LABELS[approval.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#155c43]" /> Personal Information
          </h3>
          <div className="space-y-4">
            <InfoRow icon={User} label="Full Name" value={approval.applicantName} />
            <InfoRow icon={Mail} label="Email" value={approval.email} />
            <InfoRow icon={Phone} label="Phone" value={approval.phone} />
            <InfoRow icon={Calendar} label="Date of Birth" value="— (not provided)" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-[#155c43]" /> Vehicle Information
          </h3>
          <div className="space-y-4">
            <InfoRow icon={Truck} label="Vehicle Type" value={approval.vehicleType} />
            <InfoRow icon={Car} label="Vehicle Number" value={approval.vehicleNumber} />
            <InfoRow icon={Shield} label="License Status" value="Pending verification" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#155c43]" /> DigiLocker Verification
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Identity</p>
                <p className="text-xs text-gray-500">Aadhaar verified via DigiLocker</p>
              </div>
              <button
                onClick={() => setViewingDoc("aadhaar")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#155c43] bg-white border border-[#155c43]/20 rounded-lg hover:bg-[#155c43]/5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Address</p>
                <p className="text-xs text-gray-500">Address verified from Aadhaar</p>
              </div>
              <button
                onClick={() => setViewingDoc("address_proof")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#155c43] bg-white border border-[#155c43]/20 rounded-lg hover:bg-[#155c43]/5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Documents</p>
                <p className="text-xs text-gray-500">All required documents authenticated</p>
              </div>
              <button
                onClick={() => setViewingDoc("driving_license")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#155c43] bg-white border border-[#155c43]/20 rounded-lg hover:bg-[#155c43]/5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-3 p-2 bg-emerald-50/50 rounded-lg">
            <p className="text-xs text-emerald-700 text-center font-medium">DigiLocker Verification: Completed</p>
          </div>
          {approval.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs font-medium text-gray-500 mb-1">Applicant Notes</p>
              <p className="text-sm text-gray-600">{approval.notes}</p>
            </div>
          )}
          {approval.changesMessage && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs font-medium text-blue-700 mb-1">Changes Requested</p>
              <p className="text-sm text-blue-600">{approval.changesMessage}</p>
            </div>
          )}
          {approval.rejectionReason && (
            <div className="mt-4 p-3 bg-rose-50 rounded-xl">
              <p className="text-xs font-medium text-rose-700 mb-1">Rejection Reason</p>
              <p className="text-sm text-rose-600">{approval.rejectionReason}</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#155c43]" /> Application Timeline
          </h3>
          <div className="space-y-4">
            {timeline.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${step.done ? "bg-emerald-500" : "bg-gray-200"}`} />
                <div>
                  <p className={`text-sm font-medium ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                  {step.date && <p className="text-xs text-gray-500">{formatDate(step.date)}</p>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {approval.status === "pending" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleApprove} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Approve Application
            </button>
            <button onClick={handleReject} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors">
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button onClick={handleChanges} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
              <MessageSquare className="w-4 h-4" /> Request Changes
            </button>
          </div>
        </motion.div>
      )}

      <ConfirmModal isOpen={confirmModal.open} onClose={() => setConfirmModal({ open: false, action: "" })} onConfirm={confirmApprove}
        title="Approve Delivery Partner" message="This will approve the application. The partner will be notified and can start accepting deliveries."
        confirmLabel="Approve" confirmColor="green" loading={loading} />
      <RejectModal isOpen={rejectModal} onClose={() => setRejectModal(false)} onConfirm={confirmReject} loading={loading} />
      <ChangesModal isOpen={changesModal} onClose={() => setChangesModal(false)} onConfirm={confirmChanges} loading={loading} />
      <DocumentViewerModal isOpen={!!viewingDoc} onClose={() => setViewingDoc(null)} docType={viewingDoc} applicantName={approval.applicantName} />
    </div>
  );
}
