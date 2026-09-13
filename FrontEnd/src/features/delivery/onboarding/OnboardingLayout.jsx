import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bike } from "lucide-react";

const steps = [
  { path: "/delivery/onboarding/guidelines", label: "Guidelines" },
  { path: "/delivery/onboarding/contact", label: "Details" },
  { path: "/delivery/onboarding/identity", label: "Identity" },
  { path: "/delivery/onboarding/address", label: "Address" },
  { path: "/delivery/onboarding/documents", label: "Review" },
  { path: "/delivery/onboarding/verification", label: "Submitted" },
];

export default function OnboardingLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentIdx = steps.findIndex((s) => s.path === location.pathname);

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#1B4332]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1B4332]/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#1B4332] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1B4332] flex items-center justify-center">
              <Bike className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-[#0F172A] tracking-tight">NearMart</span>
          </div>
        </motion.div>

        {/* Step indicator */}
        {currentIdx >= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.65rem] font-semibold text-[#1B4332] uppercase tracking-widest">
                Step {currentIdx + 1} of {steps.length}
              </span>
              <span className="text-[0.65rem] font-medium text-[#94A3B8]">
                {steps[currentIdx].label}
              </span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#1B4332] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIdx + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
