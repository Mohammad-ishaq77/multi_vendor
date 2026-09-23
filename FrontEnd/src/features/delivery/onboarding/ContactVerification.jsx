import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, Car, CheckCircle, ChevronRight, Mail, Phone, User } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useAuth } from "../../../hooks/useAuth";
import OnboardingLayout from "./OnboardingLayout";

const DEMO_OTP = "123456";
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const vehicles = [
  { id: "Motorcycle", label: "Bike", icon: Bike },
  { id: "Scooter", label: "Scooter", icon: Bike },
  { id: "Bicycle", label: "Cycle", icon: Bike },
  { id: "Car", label: "Car", icon: Car },
];

const fieldClass = (error) => `input-field ${error ? "border-rose-300 bg-rose-50/70" : ""}`;

export default function ContactVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contactData, setContactVerified, updateOnboardingStep, updateProfile } = useDeliveryPartner();
  const [form, setForm] = useState({
    fullName: contactData?.fullName || user?.name || "",
    phone: contactData?.phone || user?.phone || "",
    email: contactData?.email || user?.email || "",
    vehicleType: contactData?.vehicleType || "",
    vehicleNumber: contactData?.vehicleNumber || "",
  });
  const [sent, setSent] = useState({ phone: false, email: false });
  const [verified, setVerified] = useState({
    phone: Boolean(contactData?.phoneVerified),
    email: Boolean(contactData?.emailVerified),
  });
  const [otp, setOtp] = useState({ phone: "", email: "" });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const sendOtp = (channel) => {
    const value = form[channel];
    const valid = channel === "phone" ? PHONE_RE.test(value.trim()) : EMAIL_RE.test(value.trim());
    if (!valid) {
      setErrors((prev) => ({
        ...prev,
        [channel]: channel === "phone" ? "Enter a valid 10-digit mobile number" : "Enter a valid email",
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, [channel]: "" }));
    setSent((prev) => ({ ...prev, [channel]: true }));
    setOtp((prev) => ({ ...prev, [channel]: "" }));
  };

  const verifyOtp = (channel) => {
    if (otp[channel] !== DEMO_OTP) {
      setErrors((prev) => ({ ...prev, [`${channel}Otp`]: "Use demo OTP 123456" }));
      return;
    }
    setVerified((prev) => ({ ...prev, [channel]: true }));
    setErrors((prev) => ({ ...prev, [`${channel}Otp`]: "" }));
  };

  const handleContinue = () => {
    const next = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) next.fullName = "Enter your full name";
    if (!verified.phone) next.phone = "Verify your mobile number";
    if (!verified.email) next.email = "Verify your email";
    if (!form.vehicleType) next.vehicleType = "Select the vehicle you will use";
    if (form.vehicleType && form.vehicleType !== "Bicycle" && !form.vehicleNumber.trim()) {
      next.vehicleNumber = "Enter your vehicle number";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      vehicleType: form.vehicleType,
      vehicleNumber: form.vehicleNumber.trim(),
      phoneVerified: true,
      emailVerified: true,
    };
    setContactVerified(payload);
    updateProfile({
      name: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      vehicleType: payload.vehicleType,
      vehicleNumber: payload.vehicleNumber,
    });
    updateOnboardingStep("identity");
    navigate("/delivery/onboarding/identity");
  };

  const otpRow = (channel, label, Icon, type) => (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
          <input
            type={type}
            value={form[channel]}
            disabled={verified[channel]}
            onChange={(e) => update(channel, e.target.value)}
            placeholder={channel === "phone" ? "+91 98765 43210" : "you@example.com"}
            className={`${fieldClass(errors[channel])} pl-11 disabled:opacity-70`}
          />
        </div>
        <button
          type="button"
          onClick={() => sendOtp(channel)}
          disabled={verified[channel]}
          className="btn-secondary min-h-12 shrink-0 px-3 text-xs"
        >
          {verified[channel] ? "Verified" : sent[channel] ? "Resend" : "Send OTP"}
        </button>
      </div>
      {errors[channel] && <p className="text-xs text-rose-600">{errors[channel]}</p>}
      {sent[channel] && !verified[channel] && (
        <div className="flex gap-2">
          <input
            value={otp[channel]}
            onChange={(e) => setOtp((prev) => ({ ...prev, [channel]: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
            maxLength={6}
            placeholder="6-digit OTP"
            className={fieldClass(errors[`${channel}Otp`])}
          />
          <button type="button" onClick={() => verifyOtp(channel)} className="btn-primary min-h-12 shrink-0 px-4 text-xs">
            Verify
          </button>
        </div>
      )}
      {errors[`${channel}Otp`] && <p className="text-xs text-rose-600">{errors[`${channel}Otp`]}</p>}
      {verified[channel] && (
        <p className="inline-flex items-center gap-1 text-xs font-medium text-(--color-primary)">
          <CheckCircle className="h-3.5 w-3.5" /> Verified
        </p>
      )}
    </div>
  );

  return (
    <OnboardingLayout>
      <div className="space-y-5 p-5 sm:p-7 lg:p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-(--color-green-bg) text-(--color-primary)">
            <User className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-bold">Your details</h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">We'll use these to assign nearby deliveries.</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
            <input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Your full name"
              className={`${fieldClass(errors.fullName)} pl-11`}
            />
          </div>
          {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName}</p>}
        </div>

        {otpRow("phone", "Mobile number", Phone, "tel")}
        {otpRow("email", "Email address", Mail, "email")}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Vehicle</p>
          <div className="grid grid-cols-4 gap-2">
            {vehicles.map((item) => {
              const Icon = item.icon;
              const active = form.vehicleType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update("vehicleType", item.id)}
                  className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-[12px] border text-xs font-semibold ${
                    active
                      ? "border-(--color-primary) bg-(--color-green-bg) text-(--color-primary-dark)"
                      : "border-[#dce8e2] bg-white text-(--color-text-muted)"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          {errors.vehicleType && <p className="mt-1 text-xs text-rose-600">{errors.vehicleType}</p>}
        </div>

        {form.vehicleType && form.vehicleType !== "Bicycle" && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider">Vehicle number</label>
            <input
              value={form.vehicleNumber}
              onChange={(e) => update("vehicleNumber", e.target.value.toUpperCase())}
              placeholder="JK01AB1234"
              className={fieldClass(errors.vehicleNumber)}
            />
            {errors.vehicleNumber && <p className="text-xs text-rose-600">{errors.vehicleNumber}</p>}
          </div>
        )}

        <div className="rounded-[12px] border border-(--color-green-soft) bg-(--color-green-bg) px-3 py-2.5 text-xs text-(--color-primary-dark)">
          Demo OTP for mobile and email: <span className="font-mono font-bold">123456</span>
        </div>

        <button type="button" onClick={handleContinue} className="btn-primary w-full">
          Continue
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </OnboardingLayout>
  );
}
