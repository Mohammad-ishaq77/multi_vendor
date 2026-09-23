import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, LayoutDashboard, Mail, Phone } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";
import { APP_CONFIG } from "../../../config/appConfig";

export default function UnderVerification() {
  const navigate = useNavigate();
  const { submitApplication, updateOnboardingStep, contactData } = useDeliveryPartner();
  const [opening, setOpening] = useState(false);

  const handleOpenDashboard = () => {
    setOpening(true);
    submitApplication();
    updateOnboardingStep("approved");
    setTimeout(() => navigate("/delivery/dashboard"), 700);
  };

  return (
    <OnboardingLayout>
      <div className="space-y-5 p-5 text-center sm:p-7 lg:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--color-green-bg) text-(--color-primary)">
          <Clock className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Application submitted</h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">
            {contactData?.fullName ? `${contactData.fullName}, ` : ""}we'll notify you when your partner account is approved.
          </p>
        </div>

        <div className="space-y-2.5 text-left">
          {[
            { title: "Details saved", desc: "Name, mobile, email and vehicle" },
            { title: "Identity verified", desc: "Aadhaar checked via DigiLocker" },
            { title: "Under review", desc: "Usually takes a few hours" },
          ].map((item, index) => (
            <div key={item.title} className="flex items-center gap-3 rounded-[12px] border border-[#edf3ef] bg-[#f8fbf9] p-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${index < 2 ? "bg-(--color-green-bg) text-(--color-primary)" : "bg-amber-50 text-amber-600"}`}>
                {index < 2 ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-(--color-text-muted)">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[12px] border border-(--color-green-soft) bg-(--color-green-bg) p-4 text-left">
          <p className="text-xs font-semibold text-(--color-primary-dark)">Questions?</p>
          <div className="mt-2 flex flex-col gap-1 text-xs text-(--color-text-muted)">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" /> {APP_CONFIG.supportEmail}
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" /> {APP_CONFIG.supportPhone}
            </span>
          </div>
        </div>

        <button type="button" onClick={handleOpenDashboard} disabled={opening} className="btn-primary w-full">
          {opening ? "Opening dashboard..." : "Simulate approval"}
          {!opening && <LayoutDashboard className="h-4 w-4" />}
        </button>
        <p className="text-[11px] text-(--color-text-muted)">
          Demo shortcut. Live approvals happen from the admin panel.
        </p>
      </div>
    </OnboardingLayout>
  );
}
