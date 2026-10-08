import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, CheckCircle2, ChevronRight, ClipboardList, FileCheck, Info, Loader2, MapPin, User } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

export default function DocumentsUpload() {
  const navigate = useNavigate();
  const {
    submitApplication,
    contactData,
    addressData,
    identityData,
    documentsData,
    setDocumentsUploaded,
    actionError,
  } = useDeliveryPartner();
  const [submitting, setSubmitting] = useState(false);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length) await setDocumentsUploaded(files);
    event.target.value = "";
  };

  const handleContinue = async () => {
    setSubmitting(true);
    const result = await submitApplication();
    setSubmitting(false);
    if (result?.ok) navigate("/delivery/onboarding/verification");
  };

  const summary = [
    {
      icon: User,
      title: contactData?.fullName || "Partner details",
      desc: [contactData?.phone, contactData?.email].filter(Boolean).join(" · ") || "Name, mobile and email saved",
    },
    {
      icon: BadgeCheck,
      title: contactData?.vehicleType || "Vehicle",
      desc: contactData?.vehicleNumber || "Vehicle details saved",
    },
    {
      icon: MapPin,
      title: addressData?.city ? `${addressData.area || addressData.city}, ${addressData.city}` : "Address",
      desc: addressData?.pinCode ? `PIN ${addressData.pinCode}` : "Residential address saved",
    },
    {
      icon: FileCheck,
      title: "Identity",
      desc: identityData?.fullName
        ? `Aadhaar details for ${identityData.fullName}`
        : "Identity details not provided yet",
    },
  ];

  return (
    <OnboardingLayout>
      <div className="space-y-5 p-5 sm:p-7 lg:p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-(--color-green-bg) text-(--color-primary)">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-bold">Review and submit</h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">Check your details before sending the application.</p>
        </div>

        <div className="space-y-2.5">
          {summary.map((item) => (
            <div key={item.title} className="flex items-center gap-3 rounded-[12px] border border-(--color-border-soft) bg-(--color-surface-soft) p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-(--color-primary)">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="truncate text-xs text-(--color-text-muted)">{item.desc}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-(--color-primary)" />
            </div>
          ))}
        </div>

        <div className="rounded-[12px] border border-(--color-border-soft) bg-(--color-surface-soft) p-3">
          <p className="text-xs font-semibold uppercase tracking-wider">Supporting documents</p>
          <p className="mt-1 text-[11px] text-(--color-text-muted)">
            Optional. Files are uploaded to NearMart storage so an admin can review them with your application.
          </p>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleUpload}
            className="mt-2 block w-full text-xs text-(--color-text-muted) file:mr-3 file:rounded-[8px] file:border-0 file:bg-(--color-green-bg) file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-(--color-primary)"
          />
          {documentsData?.length > 0 && (
            <ul className="mt-2 space-y-1 text-[11px] text-(--color-text-muted)">
              {documentsData.map((doc) => (
                <li key={doc.url} className="truncate">
                  {doc.name} &rarr; {doc.url}
                </li>
              ))}
            </ul>
          )}
          {actionError && <p className="mt-2 text-xs text-rose-600">{actionError}</p>}
        </div>

        <div className="flex items-start gap-2 text-[11px] text-(--color-text-muted)">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-primary)" />
          <span>Submitting sends your application to the NearMart admin panel. You cannot accept deliveries until it is approved.</span>
        </div>

        <button type="button" onClick={handleContinue} disabled={submitting} className="btn-primary w-full disabled:cursor-wait disabled:opacity-60">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting application...
            </>
          ) : (
            <>
              Submit application
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </OnboardingLayout>
  );
}
