import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle, ChevronRight, FileCheck, Loader2, Shield, ShieldCheck } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

export default function IdentityVerification() {
  const navigate = useNavigate();
  const { identityData, setIdentityVerified, updateOnboardingStep, verifyWithDigiLocker } = useDeliveryPartner();
  const [verified, setVerified] = useState(identityData?.status === "verified");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    await verifyWithDigiLocker();
    setIdentityVerified({ status: "verified", aadhaarStatus: "submitted", source: "digilocker" });
    setVerified(true);
    setVerifying(false);
  };

  return (
    <OnboardingLayout>
      <div className="space-y-5 p-5 sm:p-7 lg:p-8">
        {verified ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-green-bg)] text-[var(--color-primary)]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="font-display text-xl font-bold">Identity verified</h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Aadhaar details were pulled from DigiLocker.</p>
            </div>
            {[
              { icon: BadgeCheck, title: "Aadhaar verified", desc: "Name and date of birth matched" },
              { icon: FileCheck, title: "Address proof ready", desc: "We'll confirm this on the next step" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-[12px] border border-[#edf3ef] bg-[#f8fbf9] p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-[var(--color-primary)]">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                updateOnboardingStep("address");
                navigate("/delivery/onboarding/address");
              }}
              className="btn-primary w-full"
            >
              Continue to address
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-green-bg)] text-[var(--color-primary)]">
                <Shield className="h-6 w-6" />
              </div>
              <h1 className="font-display text-xl font-bold">Verify your identity</h1>
              <p className="mx-auto mt-1 max-w-xs text-sm text-[var(--color-text-muted)]">
                Confirm Aadhaar through DigiLocker so we can approve you faster.
              </p>
            </div>
            {["Aadhaar Card", "Address proof from Aadhaar"].map((doc) => (
              <div key={doc} className="flex items-center gap-3 rounded-[12px] border border-[#edf3ef] bg-[#f8fbf9] p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-[var(--color-text-muted)]">
                  <FileCheck className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{doc}</span>
              </div>
            ))}
            <button type="button" onClick={handleVerify} disabled={verifying} className="btn-primary w-full">
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting to DigiLocker...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Verify with DigiLocker
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-[var(--color-text-muted)]">
              Demo verification only. No real DigiLocker account is used.
            </p>
          </>
        )}
      </div>
    </OnboardingLayout>
  );
}
