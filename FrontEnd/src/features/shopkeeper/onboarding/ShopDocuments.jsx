import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Shield,
  Loader2,
  FileCheck,
  Building2,
  BadgeCheck,
} from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";

const ShopDocuments = () => {
  const navigate = useNavigate();
  const { setShop, setOnboardingStep, digilockerVerified, verifyWithDigiLocker } = useShopkeeper();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(digilockerVerified);
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    await verifyWithDigiLocker();
    setVerified(true);
    setVerifying(false);
  };

  const handleSubmit = () => {
    if (!verified) return;
    setSubmitting(true);
    setTimeout(() => {
      setShop({ documents: { digilockerVerified: true }, digilockerVerified: true });
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Document Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Verify your documents securely through DigiLocker.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          {verified ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">DigiLocker Verification Completed</p>
                  <p className="text-xs text-emerald-600">All your documents have been verified successfully.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Identity Verified</p>
                    <p className="text-xs text-gray-500">Aadhaar & PAN verified via DigiLocker</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Business Details Verified</p>
                    <p className="text-xs text-gray-500">GST & Shop License verified via DigiLocker</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Documents Verified</p>
                    <p className="text-xs text-gray-500">All required documents authenticated</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">Verification completed successfully.</p>
            </motion.div>
          ) : (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Verify Your Documents with DigiLocker</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                  Securely verify your government-issued documents through DigiLocker. This includes your Aadhaar, PAN, GST Certificate, and Shop License.
                </p>
              </div>

              <div className="space-y-2">
                {["Aadhaar Card", "PAN Card", "GST Certificate", "Shop License / Trade License"].map((doc) => (
                  <div key={doc} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600">{doc}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleVerify}
                disabled={verifying}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying with DigiLocker...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Verify with DigiLocker
                  </>
                )}
              </motion.button>

              <p className="text-[0.65rem] text-gray-400 text-center">
                This is a simulated verification. No real DigiLocker API is called.
              </p>
            </div>
          )}
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
            disabled={!verified || submitting}
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
