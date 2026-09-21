import { useNavigate } from "react-router-dom";
import { BadgeCheck, CheckCircle2, ChevronRight, ClipboardList, FileCheck, MapPin, Shield, User } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

export default function DocumentsUpload() {
  const navigate = useNavigate();
  const { updateOnboardingStep, contactData, addressData, digilockerVerified } = useDeliveryPartner();

  const handleContinue = () => {
    updateOnboardingStep("verification");
    navigate("/delivery/onboarding/verification");
  };

  const summary = [
    {
      icon: User,
      title: contactData?.fullName || "Partner details",
      desc: [contactData?.phone, contactData?.email].filter(Boolean).join(" · ") || "Name, mobile and email verified",
    },
    {
      icon: BadgeCheck,
      title: contactData?.vehicleType || "Vehicle",
      desc: contactData?.vehicleNumber || "Ready for nearby deliveries",
    },
    {
      icon: MapPin,
      title: addressData?.city ? `${addressData.area}, ${addressData.city}` : "Address",
      desc: addressData?.pinCode ? `PIN ${addressData.pinCode}` : "Residential address saved",
    },
    {
      icon: FileCheck,
      title: "Identity",
      desc: digilockerVerified ? "Verified via DigiLocker" : "Aadhaar submitted",
    },
  ];

  return (
    <OnboardingLayout>
      <div className="space-y-5 p-5 sm:p-7 lg:p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-green-bg)] text-[var(--color-primary)]">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-bold">Review and submit</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Check your details before sending the application.</p>
        </div>

        {digilockerVerified && (
          <div className="flex items-center gap-3 rounded-[12px] border border-[var(--color-green-soft)] bg-[var(--color-green-bg)] p-3">
            <Shield className="h-4 w-4 text-[var(--color-primary)]" />
            <p className="text-sm font-semibold">DigiLocker verification complete</p>
          </div>
        )}

        <div className="space-y-2.5">
          {summary.map((item) => (
            <div key={item.title} className="flex items-center gap-3 rounded-[12px] border border-[#edf3ef] bg-[#f8fbf9] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-[var(--color-primary)]">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="truncate text-xs text-[var(--color-text-muted)]">{item.desc}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />
            </div>
          ))}
        </div>

        <button type="button" onClick={handleContinue} className="btn-primary w-full">
          Submit application
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </OnboardingLayout>
  );
}
