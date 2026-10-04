import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle, ChevronRight, FileCheck, Info, ShieldCheck } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

export default function IdentityVerification() {
  const navigate = useNavigate();
  const { identityData, setIdentityVerified, updateOnboardingStep } = useDeliveryPartner();
  const [fullName, setFullName] = useState(identityData?.fullName || "");
  const [dob, setDob] = useState(identityData?.dob || "");
  const [aadhaarLast4, setAadhaarLast4] = useState(identityData?.aadhaarLast4 || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submitted = Boolean(identityData?.status);

  const handleSubmit = async () => {
    setError("");
    if (!fullName.trim()) return setError("Enter the name on your Aadhaar");
    if (!dob) return setError("Enter your date of birth");
    if (!/^\d{4}$/.test(aadhaarLast4)) return setError("Enter the last 4 digits of your Aadhaar");

    setSaving(true);
    const result = await setIdentityVerified({
      fullName: fullName.trim(),
      dob,
      aadhaarLast4,
      status: "submitted",
    });
    setSaving(false);
    if (!result?.ok) {
      setError(result?.error || "We could not save your details.");
      return;
    }
    navigate("/delivery/onboarding/address");
  };

  return (
    <OnboardingLayout>
      <div className="space-y-5 p-5 sm:p-7 lg:p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-(--color-green-bg) text-(--color-primary)">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-bold">{submitted ? "Identity details submitted" : "Verify your identity"}</h1>
          <p className="mx-auto mt-1 max-w-md text-sm text-(--color-text-muted)">
            {submitted
              ? "An admin reviews these details along with your documents before approving you."
              : "Enter the details exactly as they appear on your Aadhaar. NearMart admins verify them during approval."}
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-[12px] border border-(--color-border-soft) bg-(--color-surface-soft) p-3 text-xs text-(--color-text-muted)">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-(--color-primary)" />
          <span>
            DigiLocker sign-in is not connected, so nothing is fetched automatically. Attach scans of your
            documents on the next step instead.
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" placeholder="As on Aadhaar" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Date of birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Aadhaar last 4 digits</label>
              <input
                inputMode="numeric"
                maxLength={4}
                value={aadhaarLast4}
                onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, ""))}
                className="input-field"
                placeholder="1234"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {submitted && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {[
              { icon: BadgeCheck, title: "Aadhaar details recorded", desc: "Name, DOB and last 4 digits saved" },
              { icon: FileCheck, title: "Ready for document review", desc: "Upload scans on the next screen" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-[12px] border border-(--color-border-soft) bg-(--color-surface-soft) p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-(--color-primary)">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-(--color-text-muted)">{item.desc}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-(--color-primary)" />
              </div>
            ))}
          </motion.div>
        )}

        <button type="button" onClick={handleSubmit} disabled={saving} className="btn-primary w-full">
          {saving ? "Saving..." : submitted ? "Update and continue" : "Save and continue"}
          {!saving && <ChevronRight className="h-4 w-4" />}
        </button>
        {submitted && (
          <button
            type="button"
            onClick={() => {
              updateOnboardingStep("address");
              navigate("/delivery/onboarding/address");
            }}
            className="btn-outline w-full"
          >
            Skip to address
          </button>
        )}
      </div>
    </OnboardingLayout>
  );
}