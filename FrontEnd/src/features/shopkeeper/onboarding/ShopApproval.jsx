import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  Shield,
  Mail,
  Phone,
  AlertCircle,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";

const ShopApproval = () => {
  const navigate = useNavigate();
  const { shop, setShop, setOnboardingStep, digilockerVerified } = useShopkeeper();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = () => {
    setChecking(true);
    setTimeout(() => {
      setShop({ isApproved: true });
      setOnboardingStep("approved");
      setChecking(false);
      navigate("/shopkeeper/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative w-24 h-24 mx-auto mb-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300"
          />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-600/25">
            <Clock className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pending Approval</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            Your shop <span className="font-semibold text-gray-700">{shop.name}</span> has been submitted for review. Our team will verify your details and approve your shop within 24-48 hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm mt-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Shop Created</p>
                <p className="text-xs text-gray-500">Your shop profile has been set up</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${digilockerVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                {digilockerVerified ? <BadgeCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">DigiLocker Verification</p>
                <p className="text-xs text-gray-500">
                  {digilockerVerified ? "Identity, Business & Documents verified" : "Pending verification"}
                </p>
              </div>
              {digilockerVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
            </div>

            {digilockerVerified && (
              <div className="ml-13 space-y-2">
                <div className="flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-gray-600">Identity Verified</span>
                </div>
                <div className="flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-gray-600">Business Details Verified</span>
                </div>
                <div className="flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-gray-600">Documents Verified</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Application Submitted</p>
                <p className="text-xs text-gray-500">Application sent for admin review</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Under Review</p>
                <p className="text-xs text-gray-500">Our team is reviewing your application</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 p-4 bg-blue-50/50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-xs font-semibold text-blue-800">Need help?</p>
              <p className="text-xs text-blue-600 mt-0.5">Contact our support team if you have questions about your application.</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-blue-600"><Mail className="w-3 h-3" /> support@nearmart.com</span>
                <span className="flex items-center gap-1 text-xs text-blue-600"><Phone className="w-3 h-3" /> +91 90000 00000</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheckStatus}
          disabled={checking}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-md font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {checking ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Checking Status...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Simulate Approval (Demo)
            </>
          )}
        </motion.button>
        <p className="text-[0.6rem] text-gray-400 mt-2">In production, approval happens via admin panel.</p>
      </motion.div>
    </div>
  );
};

export default ShopApproval;
