import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle,
  ChevronRight,
  FileCheck,
  KeyRound,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const isSupportedDocument = (file) =>
  file && (file.type.startsWith("image/") || file.type === "application/pdf");

export default function IdentityVerification() {
  const navigate = useNavigate();
  const {
    identityData,
    documentsData,
    setIdentityVerified,
    setDocumentsUploaded,
    updateOnboardingStep,
  } = useDeliveryPartner();
  const [fullName, setFullName] = useState(identityData?.fullName || "");
  const [dob, setDob] = useState(identityData?.dob || "");
  const [aadhaarLast4, setAadhaarLast4] = useState(identityData?.aadhaarLast4 || "");
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [studentCardFile, setStudentCardFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submitted = Boolean(identityData?.status);
  const savedAadhaar = documentsData?.find((document) => document.type === "Aadhaar Card");
  const savedStudentCard = documentsData?.find((document) => document.type === "Student Card");

  const handleSubmit = async () => {
    setError("");
    if (!fullName.trim()) return setError("Enter the name on your Aadhaar");
    if (!dob) return setError("Enter your date of birth");
    if (!/^\d{4}$/.test(aadhaarLast4)) return setError("Enter the last 4 digits of your Aadhaar");
    if (!aadhaarFile && !savedAadhaar) return setError("Upload a photo or PDF of your Aadhaar card");
    for (const [file, label] of [
      [aadhaarFile, "Aadhaar card"],
      [studentCardFile, "Student card"],
    ]) {
      if (!file) continue;
      if (!isSupportedDocument(file)) return setError(`${label} must be an image or PDF`);
      if (file.size > MAX_DOCUMENT_SIZE) return setError(`${label} must be 10 MB or smaller`);
    }

    setSaving(true);
    try {
      if (aadhaarFile) {
        const uploadResult = await setDocumentsUploaded([aadhaarFile], "Aadhaar Card");
        if (!uploadResult?.ok) {
          setError(uploadResult?.error || "We could not upload your Aadhaar card.");
          return;
        }
      }
      if (studentCardFile) {
        const uploadResult = await setDocumentsUploaded([studentCardFile], "Student Card");
        if (!uploadResult?.ok) {
          setError(uploadResult?.error || "We could not upload your student card.");
          return;
        }
      }

      const result = await setIdentityVerified({
        fullName: fullName.trim(),
        dob,
        aadhaarLast4,
        status: "submitted",
      });
      if (!result?.ok) {
        setError(result?.error || "We could not save your details.");
        return;
      }
      navigate("/delivery/onboarding/address");
    } finally {
      setSaving(false);
    }
  };

  const documentPicker = (label, file, setFile, savedDocument, optional = false) => (
    <div className="rounded-[12px] border border-(--color-border-soft) bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider">{label}</label>
        {optional && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
            Optional
          </span>
        )}
      </div>
      <label className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-dashed border-(--color-border-soft) bg-(--color-surface-soft) px-3 py-3 transition hover:border-(--color-primary)">
        <Upload className="h-4 w-4 shrink-0 text-(--color-primary)" />
        <span className="min-w-0 flex-1 truncate text-xs text-(--color-text-muted)">
          {file?.name || savedDocument?.name || (savedDocument ? "Document uploaded" : "Choose image or PDF")}
        </span>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="sr-only"
        />
      </label>
      {savedDocument?.url && !file && (
        <a
          href={savedDocument.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-(--color-primary) hover:underline"
        >
          View uploaded document
        </a>
      )}
      <p className="mt-1.5 text-[11px] text-(--color-text-muted)">Image or PDF, up to 10 MB.</p>
    </div>
  );

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
              ? "An admin reviews your Aadhaar details and uploaded documents before approving you."
              : "Provide your Aadhaar details and upload your Aadhaar card. A student card is optional."}
          </p>
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

        <div className="space-y-3">
          {documentPicker("Aadhaar card", aadhaarFile, setAadhaarFile, savedAadhaar)}
          {documentPicker("Student card", studentCardFile, setStudentCardFile, savedStudentCard, true)}
        </div>

        <div className="flex items-start gap-3 rounded-[12px] border border-(--color-border-soft) bg-white p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-(--color-green-bg) text-(--color-primary)">
            <KeyRound className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">DigiLocker verification</p>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                Optional · Coming soon
              </span>
            </div>
            <p className="mt-1 text-xs text-(--color-text-muted)">
              DigiLocker is not connected yet. Continue with your Aadhaar card; this does not affect your application.
            </p>
            <button
              type="button"
              disabled
              className="mt-2 cursor-not-allowed rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-400"
              title="DigiLocker sign-in is not configured yet"
            >
              Connect DigiLocker
            </button>
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