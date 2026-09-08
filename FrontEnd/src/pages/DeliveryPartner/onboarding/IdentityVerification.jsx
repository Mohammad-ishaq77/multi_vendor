import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function IdentityVerification() {
  const navigate = useNavigate();
  const { identityData, setIdentityVerified } = useDeliveryPartner();
  const [form, setForm] = useState({
    fullName: identityData?.fullName || "",
    dob: identityData?.dob || "",
    aadhaar: identityData?.aadhaar || "",
  });
  const [errors, setErrors] = useState({});
  const [verified, setVerified] = useState(identityData?.status === "verified");
  const [verifying, setVerifying] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.dob) errs.dob = "Date of birth is required";
    const cleanAadhaar = form.aadhaar.replace(/\s/g, "");
    if (!cleanAadhaar) errs.aadhaar = "Aadhaar number is required";
    else if (!/^\d{12}$/.test(cleanAadhaar) && !/^XXXX\s?XXXX\s?\d{4}$/.test(form.aadhaar)) errs.aadhaar = "Enter a valid 12-digit Aadhaar number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleVerify = () => {
    if (!validate()) return;
    setVerifying(true);
    setTimeout(() => {
      setIdentityVerified({ fullName: form.fullName, dob: form.dob, aadhaar: form.aadhaar, status: "verified" });
      setVerified(true);
      setVerifying(false);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h1 className="text-xl font-bold">Identity Verification</h1>
          <p className="text-emerald-100 text-sm mt-1">Verify your identity to become a delivery partner</p>
        </div>

        <div className="p-6 space-y-5">
          {verified ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Identity Verified</p>
                <p className="text-xs text-emerald-600">Your identity has been verified successfully.</p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${errors.fullName ? "border-rose-300 bg-rose-50" : "border-gray-200"}`}
                />
                {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${errors.dob ? "border-rose-300 bg-rose-50" : "border-gray-200"}`}
                />
                {errors.dob && <p className="text-xs text-rose-500 mt-1">{errors.dob}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  value={form.aadhaar}
                  onChange={(e) => setForm({ ...form, aadhaar: e.target.value })}
                  placeholder="XXXX XXXX 4582"
                  maxLength={14}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${errors.aadhaar ? "border-rose-300 bg-rose-50" : "border-gray-200"}`}
                />
                {errors.aadhaar && <p className="text-xs text-rose-500 mt-1">{errors.aadhaar}</p>}
                <p className="text-[0.65rem] text-gray-400 mt-1">This is a demo. No real Aadhaar verification is performed.</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 font-medium">Demo Mode: Aadhaar verification is simulated for frontend testing purposes only.</p>
              </div>
            </>
          )}

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/deliverypartner/onboarding/guidelines")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {verified ? (
              <button onClick={() => navigate("/deliverypartner/onboarding/address")} className="flex-1 flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleVerify} disabled={verifying} className="flex-1 flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50">
                {verifying ? "Verifying..." : "Verify Identity"}
                {!verifying && <ShieldCheck className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
