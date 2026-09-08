import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardCheck, ShieldCheck, MapPin, CheckCircle, ChevronRight, AlertTriangle } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

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

export default function DeliveryGuidelines() {
  const navigate = useNavigate();
  const { agreedToGuidelines, agreeToGuidelines } = useDeliveryPartner();
  const [agreed, setAgreed] = useState(agreedToGuidelines);

  const handleContinue = () => {
    agreeToGuidelines();
    navigate("/deliverypartner/onboarding/identity");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h1 className="text-xl font-bold">Delivery Partner Guidelines</h1>
          <p className="text-emerald-100 text-sm mt-1">Please read and agree to continue</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Eligibility */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Eligibility</h2>
            <div className="space-y-3">
              {guidelines.map((g, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <g.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{g.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{g.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Delivery Responsibilities</h2>
            <div className="space-y-2">
              {responsibilities.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Important</p>
              <p className="text-xs text-amber-600 mt-0.5">Violation of these guidelines may result in account suspension or permanent ban from the NearMart delivery partner program.</p>
            </div>
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700 font-medium">I have read and agree to the Delivery Partner Guidelines</span>
          </label>

          {/* Continue */}
          <button
            onClick={handleContinue}
            disabled={!agreed}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              agreed
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
