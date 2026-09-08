import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, X, FileText, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

const docTypes = [
  { key: "identityProof", label: "Identity Proof", desc: "Aadhaar Card, Passport, or Voter ID" },
  { key: "addressProof", label: "Address Proof", desc: "Utility Bill, Bank Statement, or Rent Agreement" },
  { key: "drivingLicense", label: "Driving License", desc: "Valid driving license for your vehicle type" },
  { key: "vehicleRegistration", label: "Vehicle Registration", desc: "RC book or vehicle registration document" },
  { key: "profilePhoto", label: "Profile Photo", desc: "Clear photo of yourself" },
];

export default function DocumentsUpload() {
  const navigate = useNavigate();
  const { documentsData, setDocumentsUploaded } = useDeliveryPartner();
  const [files, setFiles] = useState(documentsData || {});

  const handleFileSelect = (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((prev) => ({
      ...prev,
      [key]: { name: file.name, size: (file.size / 1024).toFixed(1) + " KB" },
    }));
  };

  const removeFile = (key) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const allUploaded = docTypes.every((d) => files[d.key]);

  const handleContinue = () => {
    setDocumentsUploaded(files);
    navigate("/deliverypartner/onboarding/approval");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h1 className="text-xl font-bold">Document Upload</h1>
          <p className="text-emerald-100 text-sm mt-1">Upload required documents for verification</p>
        </div>

        <div className="p-6 space-y-4">
          {docTypes.map((doc) => (
            <div key={doc.key} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{doc.label}</p>
                  <p className="text-xs text-gray-400">{doc.desc}</p>
                </div>
                {files[doc.key] && (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              {files[doc.key] ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-800 truncate">{files[doc.key].name}</p>
                    <p className="text-xs text-emerald-500">{files[doc.key].size}</p>
                  </div>
                  <button onClick={() => removeFile(doc.key)} className="p-1 text-emerald-400 hover:text-emerald-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition-all">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileSelect(doc.key, e)} accept=".pdf,.jpg,.jpeg,.png" />
                </label>
              )}
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => navigate("/deliverypartner/onboarding/address")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!allUploaded}
              className={`flex-1 flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                allUploaded ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Submit Application <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
