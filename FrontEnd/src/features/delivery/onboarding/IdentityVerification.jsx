import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ChevronRight,
  CheckCircle,
  Shield,
  Loader2,
  BadgeCheck,
  FileCheck,
} from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

export default function IdentityVerification() {
  const navigate = useNavigate();
  const { setIdentityVerified } =
    useDeliveryPartner();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setIdentityVerified({ status: "verified", aadhaarStatus: "submitted", source: "digilocker" });
      setVerified(true);
      setVerifying(false);
    }, 2000);
  };

  return (
    <OnboardingLayout>
      <div className="p-5 sm:p-6 space-y-5">
        {verified ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Title */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-[#1B4332]/10 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6 text-[#1B4332]" />
              </div>
              <h1 className="font-serif text-xl font-bold text-[#0F172A]">
                Identity Verified
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                Your identity has been verified successfully
              </p>
            </div>

            {/* Verified items */}
            <div className="space-y-2.5">
              {[
                { icon: BadgeCheck, title: "Identity Verified", desc: "Aadhaar verified via DigiLocker" },
                { icon: FileCheck, title: "Address Verified", desc: "Address from Aadhaar verified" },
                { icon: ShieldCheck, title: "Documents Verified", desc: "All required documents authenticated" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-md bg-[#F8FAFC] border border-gray-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1B4332]/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-[#1B4332]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0F172A]">{item.title}</p>
                    <p className="text-xs text-[#64748B]">{item.desc}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-[#1B4332]" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Title */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#1B4332]/20"
              >
                <Shield className="w-7 h-7 text-white" />
              </motion.div>
              <h1 className="font-serif text-xl font-bold text-[#0F172A]">
                Verify Your Identity
              </h1>
              <p className="text-sm text-[#64748B] mt-1 max-w-xs mx-auto">
                Securely verify your government-issued identity documents through DigiLocker
              </p>
            </div>

            {/* Documents list */}
            <div className="space-y-2.5">
              {["Aadhaar Card", "Address Proof"].map((doc, i) => (
                <div key={doc} className="flex items-center gap-3 p-3 rounded-md bg-[#F8FAFC] border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4 text-[#94A3B8]" />
                  </div>
                  <span className="text-sm text-[#334155] font-medium">{doc}</span>
                </div>
              ))}
            </div>

            {/* Verify button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerify}
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white py-3.5 rounded-md font-semibold text-sm shadow-lg shadow-[#1B4332]/20 hover:from-[#143728] hover:to-[#1B4332] transition-all disabled:opacity-50"
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

            <p className="text-[0.65rem] text-[#94A3B8] text-center">
              This is a simulated verification. No real DigiLocker API is called.
            </p>
          </>
        )}

        {/* Continue */}
        {verified && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/delivery/onboarding/address")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold bg-[#1B4332] text-white hover:bg-[#143728] shadow-lg shadow-[#1B4332]/20 transition-all"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </OnboardingLayout>
  );
}
