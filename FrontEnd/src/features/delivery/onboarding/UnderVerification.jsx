import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

export default function UnderVerification() {
  const navigate = useNavigate();
  const { submitApplication } = useDeliveryPartner();

  const handleOpenDashboard = () => {
    submitApplication();
    navigate("/delivery/dashboard");
  };

  return (
    <OnboardingLayout>
      <div className="p-5 sm:p-6 space-y-5 text-center">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
          className="mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center mx-auto shadow-lg shadow-[#1B4332]/20">
            <Clock className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <div>
          <h1 className="font-serif text-xl font-bold text-[#0F172A]">
            Under Verification
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Your details have been submitted successfully
          </p>
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 text-left p-3.5 bg-[#1B4332]/[0.04] border border-[#1B4332]/10 rounded-xl"
        >
          <CheckCircle className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
          <p className="text-sm text-[#334155] leading-relaxed">
            This is a frontend demo. Backend verification will be connected later.
          </p>
        </motion.div>

        {/* Open Dashboard */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenDashboard}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#143728] shadow-lg shadow-[#1B4332]/20 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          Open Demo Dashboard
        </motion.button>
      </div>
    </OnboardingLayout>
  );
}
