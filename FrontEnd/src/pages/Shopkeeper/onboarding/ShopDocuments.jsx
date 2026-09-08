import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";

const ShopDocuments = () => {
  const navigate = useNavigate();
  const { setShop, setOnboardingStep } = useShopkeeper();
  const [documents, setDocuments] = useState({
    shopLicense: null,
    gstCertificate: null,
    ownerPan: null,
    ownerAadhaar: null,
    shopPhoto: null,
  });
  const [uploading, setUploading] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const docFields = [
    { key: "shopLicense", label: "Shop License / Trade License", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "gstCertificate", label: "GST Certificate", required: false, accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "ownerPan", label: "Owner PAN Card", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "ownerAadhaar", label: "Owner Aadhaar Card", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "shopPhoto", label: "Shop Photo (Front)", required: false, accept: ".jpg,.jpeg,.png" },
  ];

  const handleFileSelect = (key, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    setUploading(key);
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        setDocuments((prev) => ({ ...prev, [key]: { name: file.name, size: file.size, preview: reader.result } }));
        setUploading(null);
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (key) => {
    setDocuments((prev) => ({ ...prev, [key]: null }));
  };

  const requiredDocs = docFields.filter((d) => d.required);
  const allRequiredUploaded = requiredDocs.every((d) => documents[d.key]);

  const handleSubmit = () => {
    if (!allRequiredUploaded) return;
    setSubmitting(true);
    setTimeout(() => {
      setShop({ documents });
      setOnboardingStep("approval");
      navigate("/shopkeeper/onboarding/approval");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/25 mx-auto mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Upload Documents</h1>
          <p className="text-sm text-gray-500 mt-1">Upload required documents for verification. This helps us ensure trust and safety.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="space-y-4">
            {docFields.map((field) => (
              <div key={field.key}>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>

                {documents[field.key] ? (
                  <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-200 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{documents[field.key].name}</p>
                      <p className="text-xs text-gray-500">{(documents[field.key].size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => removeDocument(field.key)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                    uploading === field.key
                      ? "border-emerald-400 bg-emerald-50/30"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/20"
                  }`}>
                    {uploading === field.key ? (
                      <div className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">Click to upload</span>
                        <span className="text-[0.6rem] text-gray-400">PDF, JPG, PNG (max 5MB)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept={field.accept}
                      onChange={(e) => handleFileSelect(field.key, e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 mt-5 p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Required documents: Shop License, Owner PAN, and Owner Aadhaar. Your documents will be reviewed by our team within 24-48 hours.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { setOnboardingStep("create_shop"); navigate("/shopkeeper/onboarding/create-shop"); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!allRequiredUploaded || submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Submit for Approval <ChevronRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ShopDocuments;
