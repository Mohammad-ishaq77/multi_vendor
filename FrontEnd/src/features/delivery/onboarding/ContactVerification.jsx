import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, User, ShieldCheck, ChevronRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

const DEMO_OTP = "123456";

export default function ContactVerification() {
  const navigate = useNavigate();
  const { contactData, setContactVerified } = useDeliveryPartner();
  const [form, setForm] = useState({
    fullName: contactData?.fullName || "",
    phone: contactData?.phone || "",
    email: contactData?.email || "",
  });
  const [sent, setSent] = useState({ phone: false, email: false });
  const [verified, setVerified] = useState({
    phone: contactData?.phoneVerified || false,
    email: contactData?.emailVerified || false,
  });
  const [otp, setOtp] = useState({ phone: "", email: "" });
  const [errors, setErrors] = useState({});

  const sendOtp = (channel) => {
    const value = form[channel];
    const valid =
      channel === "phone"
        ? /^\+?[0-9\s-]{10,}$/.test(value)
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!valid) {
      setErrors((prev) => ({
        ...prev,
        [channel]: `Enter a valid ${channel === "phone" ? "mobile number" : "email address"}`,
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, [channel]: "" }));
    setSent((prev) => ({ ...prev, [channel]: true }));
  };

  const verifyOtp = (channel) => {
    if (otp[channel] !== DEMO_OTP) {
      setErrors((prev) => ({
        ...prev,
        [`${channel}Otp`]: "Use the 6-digit OTP sent to you.",
      }));
      return;
    }
    setVerified((prev) => ({ ...prev, [channel]: true }));
    setErrors((prev) => ({ ...prev, [`${channel}Otp`]: "" }));
  };

  const handleContinue = () => {
    if (!form.fullName.trim()) {
      setErrors((prev) => ({ ...prev, fullName: "Full name is required" }));
      return;
    }
    if (!verified.phone || !verified.email) {
      setErrors((prev) => ({
        ...prev,
        form: "Verify both your mobile number and email to continue.",
      }));
      return;
    }
    setContactVerified({
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      phoneVerified: true,
      emailVerified: true,
    });
    navigate("/delivery/onboarding/identity");
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200 ${
      errors[field]
        ? "border-rose-300 bg-rose-50/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        : "border-gray-200 bg-[#F8FAFC] focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10 focus:bg-white"
    }`;

  const field = (channel, label, Icon, type) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
        <Icon className="w-3.5 h-3.5 text-[#1B4332]" />
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type={type}
          value={form[channel]}
          disabled={verified[channel]}
          onChange={(e) => setForm({ ...form, [channel]: e.target.value })}
          placeholder={channel === "phone" ? "+91 98765 43210" : "you@example.com"}
          className={`${inputClass(channel)} flex-1 disabled:bg-gray-50 disabled:text-gray-500`}
        />
        <button
          type="button"
          onClick={() => sendOtp(channel)}
          disabled={verified[channel]}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            verified[channel]
              ? "bg-[#1B4332]/10 text-[#1B4332]"
              : "bg-[#0F172A] text-white hover:bg-[#1E293B]"
          }`}
        >
          {verified[channel] ? "Verified" : sent[channel] ? "Resend" : "Send OTP"}
        </button>
      </div>
      {errors[channel] && (
        <p className="text-xs text-rose-500">{errors[channel]}</p>
      )}
      {sent[channel] && !verified[channel] && (
        <div className="flex gap-2">
          <input
            value={otp[channel]}
            onChange={(e) => setOtp({ ...otp, [channel]: e.target.value })}
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className={`${inputClass(channel)} flex-1`}
          />
          <button
            type="button"
            onClick={() => verifyOtp(channel)}
            className="px-3.5 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#143728] transition-colors"
          >
            Verify
          </button>
        </div>
      )}
      {errors[`${channel}Otp`] && (
        <p className="text-xs text-rose-500">{errors[`${channel}Otp`]}</p>
      )}
      {sent[channel] && !verified[channel] && (
        <p className="text-[0.65rem] text-[#94A3B8]">Demo OTP: 123456</p>
      )}
      {verified[channel] && (
        <p className="flex items-center gap-1 text-xs text-[#1B4332] font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          Verified successfully
        </p>
      )}
    </div>
  );

  return (
    <OnboardingLayout>
      <div className="p-5 sm:p-6 space-y-5">
        {/* Title */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#1B4332]/10 flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-[#1B4332]" />
          </div>
          <h1 className="font-serif text-xl font-bold text-[#0F172A]">
            Basic Details
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Verify your name, mobile number, and email
          </p>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
            <User className="w-3.5 h-3.5 text-[#1B4332]" />
            Full name
          </label>
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Enter your full name"
            className={inputClass("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-rose-500">{errors.fullName}</p>
          )}
        </div>

        {/* Phone */}
        {field("phone", "Mobile number", Phone, "tel")}

        {/* Email */}
        {field("email", "Email address", Mail, "email")}

        {/* Demo hint */}
        <div className="flex items-start gap-2.5 p-3 bg-[#1B4332]/[0.04] border border-[#1B4332]/10 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
          <p className="text-[0.7rem] text-[#334155] leading-relaxed">
            Demo OTP for both fields: <span className="font-mono font-bold">123456</span>
          </p>
        </div>

        {errors.form && (
          <p className="text-xs text-rose-500">{errors.form}</p>
        )}

        {/* Continue */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#1B4332] text-white hover:bg-[#143728] shadow-lg shadow-[#1B4332]/20 transition-all"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </OnboardingLayout>
  );
}
