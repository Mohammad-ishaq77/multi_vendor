import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Contact,
  CreditCard,
  FileCheck,
  Loader2,
  Shield,
  Store,
} from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";
import ShopOnboardingLayout from "./ShopOnboardingLayout";

const docs = [
  { title: "Aadhaar Card", desc: "Identity of the shop owner", icon: Contact },
  { title: "PAN Card", desc: "Tax identity for payouts", icon: CreditCard },
  { title: "GST Certificate", desc: "Optional if your shop is GST registered", icon: Building2 },
  { title: "Shop / Trade License", desc: "Local municipal or trade license", icon: Store },
];

const ShopDocuments = () => {
  const navigate = useNavigate();
  const { shop, setShop, setOnboardingStep, digilockerVerified, verifyWithDigiLocker } = useShopkeeper();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(digilockerVerified);
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    await verifyWithDigiLocker();
    setVerified(true);
    setVerifying(false);
  };

  const handleSubmit = () => {
    if (!verified) return;
    setSubmitting(true);
    setTimeout(() => {
      setShop({ documents: { digilockerVerified: true }, digilockerVerified: true });
      setOnboardingStep("approval");
      navigate("/shopkeeper/onboarding/approval");
    }, 450);
  };

  return (
    <ShopOnboardingLayout
      stepKey="documents"
      onBack={() => {
        setOnboardingStep("create_shop");
        navigate("/shopkeeper/onboarding/create-shop");
      }}
    >
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-(--color-green-bg) text-(--color-primary)">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">Verify documents</h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">
            Confirm identity for {shop.name || "your shop"} with DigiLocker.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            {verified ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-3 rounded-[16px] border border-(--color-green-soft) bg-(--color-green-bg) p-4">
                  <CheckCircle2 className="h-5 w-5 text-(--color-primary)" />
                  <div>
                    <p className="text-sm font-semibold">DigiLocker verification complete</p>
                    <p className="text-xs text-(--color-text-muted)">Identity, business and documents are ready for review.</p>
                  </div>
                </div>
                {[
                  { icon: BadgeCheck, title: "Identity verified", desc: "Aadhaar and PAN matched" },
                  { icon: Building2, title: "Business verified", desc: "GST and shop license confirmed" },
                  { icon: FileCheck, title: "Documents authenticated", desc: "Files pulled from DigiLocker" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-[16px] border border-[#edf3ef] bg-[#f8fbf9] p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-(--color-primary)">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-(--color-text-muted)">{item.desc}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-(--color-primary)" />
                  </div>
                ))}
              </motion.div>
            ) : (
              docs.map((doc) => (
                <div key={doc.title} className="flex items-center gap-3 rounded-[16px] border border-[#edf3ef] bg-[#f8fbf9] p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-(--color-primary)">
                    <doc.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{doc.title}</p>
                    <p className="text-xs text-(--color-text-muted)">{doc.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="rounded-[16px] border border-(--color-green-soft) bg-(--color-green-bg)/60 p-5 lg:p-6">
            <p className="text-sm font-semibold">Secure verification</p>
            <p className="mt-1 text-xs leading-relaxed text-(--color-text-muted)">
              DigiLocker pulls government documents so you don't need to upload scans.
            </p>
            {!verified && (
              <>
                <button type="button" onClick={handleVerify} disabled={verifying} className="btn-primary mt-5 w-full">
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Verify with DigiLocker
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-[11px] text-(--color-text-muted)">
                  Demo only. No real DigiLocker account is used.
                </p>
              </>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!verified || submitting}
              className="btn-primary mt-4 w-full"
            >
              {submitting ? "Submitting..." : "Submit for approval"}
            </button>
          </aside>
        </div>
      </div>
    </ShopOnboardingLayout>
  );
};

export default ShopDocuments;
