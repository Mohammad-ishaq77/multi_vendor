import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardCheck, ShieldCheck, MapPin, CheckCircle, ChevronRight, AlertTriangle } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

const guidelines = [
  { icon: ClipboardCheck, title: "Eligibility", text: "You must be 18 years or older." },
  { icon: ShieldCheck, title: "Identity", text: "Valid identity/Aadhaar verification is required." },
  { icon: MapPin, title: "Address", text: "Valid residential/current address must be provided." },
];

const responsibilities = [
  "Keep packages safe during transportation.",
  "Do not open sealed packages under any circumstances.",
  "Verify pickup from the shop using the provided code.",
  "Verify customer delivery using OTP before handing over.",
  "Maintain professional behavior with customers and shops.",
  "Follow delivery instructions provided by the customer.",
  "Complete deliveries accurately and on time.",
];

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
};

export default function DeliveryGuidelines() {
  const navigate = useNavigate();
  const { agreedToGuidelines, agreeToGuidelines } = useDeliveryPartner();
  const [agreed, setAgreed] = useState(agreedToGuidelines);

  const handleContinue = () => {
    agreeToGuidelines();
    navigate("/delivery/onboarding/contact");
  };

  return (
    <OnboardingLayout>
      <div className="p-5 sm:p-6 space-y-5">
        {/* Title */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-[#1B4332]/10 flex items-center justify-center mx-auto mb-3">
            <ClipboardCheck className="w-6 h-6 text-[#1B4332]" />
          </div>
          <h1 className="font-serif text-xl font-bold text-[#0F172A]">
            Delivery Partner Guidelines
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Please read and agree to continue
          </p>
        </div>

        {/* Eligibility */}
        <div>
          <h2 className="text-[0.65rem] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
            Eligibility
          </h2>
          <div className="space-y-2.5">
            {guidelines.map((g, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={item}
                initial="hidden"
                animate="visible"
                className="flex items-start gap-3 p-3 rounded-md bg-[#F8FAFC] border border-gray-100"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] shrink-0">
                  <g.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{g.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{g.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Responsibilities */}
        <div>
          <h2 className="text-[0.65rem] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
            Delivery Responsibilities
          </h2>
          <div className="space-y-2">
            {responsibilities.map((r, i) => (
              <motion.div
                key={i}
                custom={i + 3}
                variants={item}
                initial="hidden"
                animate="visible"
                className="flex items-start gap-2.5 text-sm text-[#64748B]"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#1B4332] shrink-0 mt-0.5" />
                <span className="text-[0.8rem]">{r}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-3.5 bg-amber-50/80 border border-amber-100 rounded-md">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Important</p>
            <p className="text-[0.7rem] text-amber-600 mt-0.5 leading-relaxed">
              Violation of these guidelines may result in account suspension or permanent ban.
            </p>
          </div>
        </div>

        {/* Agreement */}
        <label className="flex items-start gap-3 cursor-pointer p-3.5 bg-[#F8FAFC] rounded-md border border-gray-100 hover:border-[#1B4332]/20 transition-colors">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1B4332] focus:ring-[#1B4332]"
          />
          <span className="text-sm text-[#334155] font-medium leading-snug">
            I have read and agree to the Delivery Partner Guidelines
          </span>
        </label>

        {/* Continue */}
        <motion.button
          whileHover={agreed ? { scale: 1.01 } : {}}
          whileTap={agreed ? { scale: 0.98 } : {}}
          onClick={handleContinue}
          disabled={!agreed}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold transition-all ${
            agreed
              ? "bg-[#1B4332] text-white hover:bg-[#143728] shadow-lg shadow-[#1B4332]/20"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </OnboardingLayout>
  );
}
