import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Shield, BadgeCheck, FileCheck, ClipboardList } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

const items = [
  { icon: BadgeCheck, title: "Identity Verified", desc: "Aadhaar verified via DigiLocker" },
  { icon: FileCheck, title: "Address Verified", desc: "Address verified via DigiLocker" },
  { icon: Shield, title: "Documents Verified", desc: "All required documents authenticated" },
];

export default function DocumentsUpload() {
  const navigate = useNavigate();
  const { submitApplication, digilockerVerified } = useDeliveryPartner();

  const handleContinue = () => {
    submitApplication();
    navigate("/delivery/onboarding/verification");
  };

  return (
    <OnboardingLayout>
      <div className="p-5 sm:p-6 space-y-5">
        {/* Title */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-[#1B4332]/10 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6 text-[#1B4332]" />
          </div>
          <h1 className="font-serif text-xl font-bold text-[#0F172A]">
            Verification Summary
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Review your verification status before submitting
          </p>
        </div>

        {/* DigiLocker badge */}
        {digilockerVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-3.5 bg-[#1B4332]/[0.04] border border-[#1B4332]/10 rounded-md"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B4332]/10 flex items-center justify-center shrink-0">
              <Shield className="w-4.5 h-4.5 text-[#1B4332]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                DigiLocker Verification Completed
              </p>
              <p className="text-xs text-[#64748B]">
                All documents verified through DigiLocker
              </p>
            </div>
          </motion.div>
        )}

        {/* Items */}
        <div className="space-y-2.5">
          {items.map((item, i) => (
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
              <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
            </motion.div>
          ))}
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold bg-[#1B4332] text-white hover:bg-[#143728] shadow-lg shadow-[#1B4332]/20 transition-all"
        >
          Submit Application
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </OnboardingLayout>
  );
}
