import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Loader2, Mail, Phone, User } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useAuth } from "../../../hooks/useAuth";
import OnboardingLayout from "./OnboardingLayout";

const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass = (error) => `input-field ${error ? "border-rose-300 bg-rose-50/70" : ""}`;

export default function ContactVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contactData, setContactVerified, actionError } = useDeliveryPartner();
  const [form, setForm] = useState({
    fullName: contactData?.fullName || user?.name || "",
    phone: contactData?.phone || user?.phone || "",
    email: contactData?.email || user?.email || "",
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
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    };
    try {
      // POST /delivery/onboarding stores the contact payload on the partner row.
      const result = await setContactVerified(payload);
      if (!result?.ok) return;

      navigate("/delivery/onboarding/identity");
    } finally {
      setSaving(false);
    }
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