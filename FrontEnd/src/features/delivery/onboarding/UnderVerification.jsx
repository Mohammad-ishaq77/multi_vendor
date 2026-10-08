import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Clock, Loader2, Mail, Phone, RefreshCw } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";
import { APP_CONFIG } from "../../../config/appConfig";

export default function UnderVerification() {
  const navigate = useNavigate();
  const { refresh, isApproved, applicationStatus, applicationNotes, actionError, error, contactData } = useDeliveryPartner();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isApproved) navigate("/delivery/dashboard", { replace: true });
  }, [isApproved, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const isRejected = applicationStatus === "rejected";

  return (
    <OnboardingLayout>
      <div className="space-y-5 p-5 text-center sm:p-7 lg:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--color-green-bg) text-(--color-primary)">
          {isRejected ? <AlertCircle className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">
            {isRejected ? "Application needs attention" : "Application submitted"}
          </h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">
            {contactData?.fullName ? `${contactData.fullName}, ` : ""}
            {isRejected
              ? "your application needs updates before it can be reviewed again. Follow the admin's notes, update your details, and resubmit."
              : "your application is waiting for admin approval. You can start accepting deliveries once approved."}
          </p>
        </div>

        {isRejected && applicationNotes && (
          <div className="rounded-[12px] border border-rose-200 bg-rose-50 p-4 text-left">
            <p className="text-xs font-semibold text-rose-700">Admin feedback</p>
            <p className="mt-1 text-sm text-rose-700">{applicationNotes}</p>
          </div>
        )}

        <div className="space-y-2.5 text-left">
          {[
            { title: "Application submitted", desc: "Your details and documents were sent for review" },
            { title: "Admin review", desc: "Your account must be approved before you can work" },
            { title: isRejected ? "Application rejected" : "Waiting for approval", desc: isRejected ? "Contact support if you need help" : "Refresh this page to check your status" },
          ].map((item, index) => (
            <div key={item.title} className="flex items-center gap-3 rounded-[12px] border border-[#edf3ef] bg-[#f8fbf9] p-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${isRejected && index === 2 ? "bg-rose-50 text-rose-600" : index === 0 ? "bg-(--color-green-bg) text-(--color-primary)" : "bg-amber-50 text-amber-600"}`}>
                {isRejected && index === 2 ? <AlertCircle className="h-4 w-4" /> : index === 0 ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-(--color-text-muted)">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {(actionError || error) && (
          <p role="alert" className="text-left text-sm text-rose-600">
            {actionError || error}
          </p>
        )}

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

        <button type="button" onClick={handleRefresh} disabled={refreshing} className="btn-primary w-full disabled:cursor-wait disabled:opacity-60">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {refreshing ? "Checking approval..." : "Check approval status"}
        </button>
        {isRejected && (
          <button
            type="button"
            onClick={() => navigate("/delivery/onboarding/identity")}
            className="btn-secondary w-full"
          >
            Update identity and documents
          </button>
        )}
        <p className="text-[11px] text-(--color-text-muted)">
          Your delivery dashboard will open automatically after an admin approves your application.
        </p>
      </div>
    </OnboardingLayout>
  );
}
