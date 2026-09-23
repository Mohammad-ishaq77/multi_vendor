import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, Clock, Mail, Phone, Shield, Store } from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";
import ShopOnboardingLayout from "./ShopOnboardingLayout";
import { APP_CONFIG } from "../../../config/appConfig";

const ShopApproval = () => {
  const navigate = useNavigate();
  const { shop, setShop, setOnboardingStep, digilockerVerified } = useShopkeeper();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = () => {
    setChecking(true);
    setTimeout(() => {
      setShop({ isApproved: true });
      setOnboardingStep("approved");
      setChecking(false);
      navigate("/shopkeeper/dashboard");
    }, 1200);
  };

  const timeline = [
    { title: "Shop created", desc: shop.name || "Your shop profile is ready", done: true, icon: Store },
    {
      title: "Documents",
      desc: digilockerVerified ? "DigiLocker verification complete" : "Pending verification",
      done: digilockerVerified,
      icon: BadgeCheck,
    },
    { title: "Application submitted", desc: "Sent to the NearMart review team", done: true, icon: CheckCircle2 },
    { title: "Under review", desc: "Usually takes 24–48 hours", done: false, icon: Clock },
  ];

  return (
    <ShopOnboardingLayout stepKey="approval" onBack={() => navigate("/shopkeeper/onboarding/documents")}>
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="mb-6 flex items-start gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-(--color-green-bg) text-(--color-primary)"
          >
            <Clock className="h-7 w-7" />
          </motion.div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">Application submitted</h1>
            <p className="mt-1 max-w-xl text-sm text-(--color-text-muted)">
              {shop.name ? (
                <>
                  <span className="font-semibold text-(--color-text)">{shop.name}</span> is waiting for review. We'll
                  email you when it's live.
                </>
              ) : (
                "Your shop is waiting for review. We'll email you when it's live."
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {timeline.map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-[16px] border border-[#edf3ef] bg-[#f8fbf9] p-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${
                    item.done ? "bg-(--color-green-bg) text-(--color-primary)" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {item.done ? <item.icon className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-(--color-text-muted)">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-[16px] border border-(--color-green-soft) bg-(--color-green-bg)/60 p-5 lg:p-6">
            <p className="text-sm font-semibold text-(--color-primary-dark)">Need help?</p>
            <p className="mt-1 text-xs text-(--color-text-muted)">The review team usually replies within 24–48 hours.</p>
            <div className="mt-4 space-y-2 text-sm text-(--color-text-muted)">
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-(--color-primary)" /> {APP_CONFIG.supportEmail}
              </p>
              <p className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-(--color-primary)" /> {APP_CONFIG.supportPhone}
              </p>
            </div>
            <button type="button" onClick={handleCheckStatus} disabled={checking} className="btn-primary mt-6 w-full">
              {checking ? "Checking status..." : "Simulate approval"}
              {!checking && <Shield className="h-4 w-4" />}
            </button>
            <p className="mt-2 text-center text-[11px] text-(--color-text-muted)">
              In production, approval happens from the admin panel.
            </p>
          </aside>
        </div>
      </div>
    </ShopOnboardingLayout>
  );
};

export default ShopApproval;
