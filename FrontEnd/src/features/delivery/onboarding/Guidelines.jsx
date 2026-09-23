import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, ChevronRight, ClipboardCheck, MapPin, ShieldCheck } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

const guidelines = [
  { icon: ClipboardCheck, title: "Eligibility", text: "You must be 18 or older and legally allowed to work." },
  { icon: ShieldCheck, title: "Identity", text: "Aadhaar verification is required before you can go online." },
  { icon: MapPin, title: "Service area", text: "We'll assign nearby pickups based on your saved address." },
];

const responsibilities = [
  "Keep packages sealed and safe until handover.",
  "Verify pickup at the shop with the order code.",
  "Confirm delivery with the customer OTP.",
  "Stay professional with shops and customers.",
  "Follow delivery notes and complete drops on time.",
];

export default function DeliveryGuidelines() {
  const navigate = useNavigate();
  const { agreedToGuidelines, agreeToGuidelines, updateOnboardingStep } = useDeliveryPartner();
  const [agreed, setAgreed] = useState(agreedToGuidelines);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!agreed) {
      setError("Please agree to the guidelines to continue");
      return;
    }
    agreeToGuidelines();
    updateOnboardingStep("contact");
    navigate("/delivery/onboarding/contact");
  };

  return (
    <OnboardingLayout>
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-(--color-green-bg) text-(--color-primary)">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold lg:text-3xl">Partner guidelines</h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">
            Read these once — they keep deliveries safe for everyone.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">Eligibility</p>
            <div className="space-y-2.5">
              {guidelines.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-[16px] border border-[#edf3ef] bg-[#f8fbf9] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-white text-(--color-primary)">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-(--color-text-muted)">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">On the road</p>
            <div className="space-y-2">
              {responsibilities.map((item) => (
                <div key={item} className="flex items-start gap-2.5 rounded-[16px] border border-[#edf3ef] bg-[#f8fbf9] p-3.5 text-sm text-(--color-text-muted)">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-(--color-primary)" />
                  <span className="text-[13px]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-[16px] border border-amber-100 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            Breaking these rules can lead to a temporary pause or a permanent ban.
          </p>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[16px] border border-[#dce8e2] bg-white p-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              setError("");
            }}
            className="mt-0.5 h-4 w-4 rounded border-[#dce8e2] accent-(--color-primary)"
          />
          <span className="text-sm font-medium">I have read and agree to the delivery partner guidelines</span>
        </label>
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

        <button type="button" onClick={handleContinue} className="btn-primary mt-5">
          Continue
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </OnboardingLayout>
  );
}
