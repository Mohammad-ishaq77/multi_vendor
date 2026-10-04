import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, Car, ChevronRight, Info, Loader2, Mail, Phone, User } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useAuth } from "../../../hooks/useAuth";
import OnboardingLayout from "./OnboardingLayout";

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
  const { contactData, setContactVerified, updateProfile, actionError } = useDeliveryPartner();
  const [form, setForm] = useState({
    fullName: contactData?.fullName || user?.name || "",
    phone: contactData?.phone || user?.phone || "",
    email: contactData?.email || user?.email || "",
    vehicleType: contactData?.vehicleType || "",
    vehicleNumber: contactData?.vehicleNumber || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleContinue = async () => {
    const next = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) next.fullName = "Enter your full name";
    if (!PHONE_RE.test(form.phone.trim())) next.phone = "Enter a valid 10-digit mobile number";
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email";
    if (!form.vehicleType) next.vehicleType = "Select the vehicle you will use";
    if (form.vehicleType && form.vehicleType !== "Bicycle" && !form.vehicleNumber.trim()) {
      next.vehicleNumber = "Enter your vehicle number";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      vehicleType: form.vehicleType,
      vehicleNumber: form.vehicleNumber.trim(),
    };
    // POST /delivery/onboarding stores the contact payload on the partner row.
    const result = await setContactVerified(payload);
    if (result?.ok) {
      await updateProfile({ vehicleType: payload.vehicleType, vehicleNumber: payload.vehicleNumber });
    }
    setSaving(false);
    if (!result?.ok) return;
    navigate("/delivery/onboarding/identity");
  };

  const fieldRow = (field, label, Icon, type, placeholder) => (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
        <input
          type={type}
          value={form[field]}
          onChange={(e) => update(field, e.target.value)}
          placeholder={placeholder}
          className={`${fieldClass(errors[field])} pl-11`}
        />
      </div>
      {errors[field] && <p className="text-xs text-rose-600">{errors[field]}</p>}
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

        {fieldRow("phone", "Mobile number", Phone, "tel", "+91 98765 43210")}
        {fieldRow("email", "Email address", Mail, "email", "you@example.com")}

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
                      : "border-(--color-border-soft) bg-white text-(--color-text-muted)"
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

        <div className="flex items-start gap-2 rounded-[12px] border border-(--color-border-soft) bg-(--color-surface-soft) px-3 py-2.5 text-xs text-(--color-text-muted)">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-(--color-primary)" />
          <span>
            NearMart does not send OTPs, so there is no code to enter here. An admin confirms your mobile number
            while reviewing your application.
          </span>
        </div>

        {actionError && <p className="text-xs text-rose-600">{actionError}</p>}

        <button type="button" onClick={handleContinue} disabled={saving} className="btn-primary w-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </OnboardingLayout>
  );
}