import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, Clock, Mail, Phone, RefreshCw, Store, XCircle } from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";
import ShopOnboardingLayout from "./ShopOnboardingLayout";
import { APP_CONFIG } from "../../../config/appConfig";

/** UI copy for the approval row the API returns in GET /shopkeeper/status. */
const STATUS_VIEW = {
  pending: {
    title: "Application submitted",
    body: (shopName) => (
      <>
        <span className="font-semibold text-(--color-text)">{shopName}</span> is waiting for review. An admin
        approves it from the NearMart panel and we email you when it goes live.
      </>
    ),
    tone: "amber",
    icon: Clock,
  },
  approved: {
    title: "You're approved",
    body: () => <>Your shop is live. Customers can browse your products and place orders right now.</>,
    tone: "green",
    icon: CheckCircle2,
  },
  rejected: {
    title: "Application needs changes",
    body: () => <>An admin reviewed your application and asked for changes. Check the notes below.</>,
    tone: "red",
    icon: XCircle,
  },
};

const ShopApproval = () => {
  const navigate = useNavigate();
  const { shop, shopStatus, documents, refresh, loading } = useShopkeeper();

  const approvalStatus = shopStatus?.approval?.status || (shop?.isApproved ? "approved" : "pending");
  const view = STATUS_VIEW[approvalStatus] || STATUS_VIEW.pending;
  const StatusIcon = view.icon;
  const shopName = shop?.name || "Your shop";
  const appliedAt = shopStatus?.approval?.appliedAt;

  const timeline = [
    {
      title: "Shop created",
      desc: `${shopName} is saved on the server`,
      done: Boolean(shop?.id),
      icon: Store,
    },
    {
      title: "Documents uploaded",
      desc: documents.length
        ? `${documents.length} document(s) sent for review`
        : "No documents uploaded in this session",
      done: documents.length > 0,
      icon: BadgeCheck,
    },
    {
      title: "Application submitted",
      desc: appliedAt ? `Submitted ${new Date(appliedAt).toLocaleString()}` : "Waiting in the review queue",
      done: Boolean(shopStatus?.approval || shop?.id),
      icon: CheckCircle2,
    },
    {
      title: approvalStatus === "approved" ? "Approved" : "Under review",
      desc: approvalStatus === "rejected" ? "Changes requested by an admin" : "Usually takes 24-48 hours",
      done: approvalStatus === "approved",
      icon: Clock,
    },
  ];

  return (
    <ShopOnboardingLayout
      stepKey="approval"
      onBack={() => navigate("/shopkeeper/onboarding/documents")}
    >
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="mb-6 flex items-start gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] ${
              view.tone === "red"
                ? "bg-red-50 text-red-600"
                : view.tone === "green"
                  ? "bg-(--color-green-bg) text-(--color-primary)"
                  : "bg-amber-50 text-amber-600"
            }`}
          >
            <StatusIcon className="h-7 w-7" />
          </motion.div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">{view.title}</h1>
            <p className="mt-1 max-w-xl text-sm text-(--color-text-muted)">{view.body(shopName)}</p>
          </div>
        </div>

        {shopStatus?.approval?.notes && approvalStatus === "rejected" && (
          <div className="mb-5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">Reviewer notes</p>
            <p className="mt-1">{shopStatus.approval.notes}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {timeline.map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-[16px] border border-(--color-border-soft) bg-(--color-surface-soft) p-4">
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
            <p className="mt-1 text-xs text-(--color-text-muted)">
              The review team usually responds within 24-48 hours.
            </p>
            <div className="mt-4 space-y-2 text-sm text-(--color-text-muted)">
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-(--color-primary)" /> {APP_CONFIG.supportEmail}
              </p>
              <p className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-(--color-primary)" /> {APP_CONFIG.supportPhone}
              </p>
            </div>
            <button type="button" onClick={refresh} disabled={loading} className="btn-primary mt-6 w-full">
              {loading ? "Checking status..." : "Refresh status"}
              {!loading && <RefreshCw className="h-4 w-4" />}
            </button>
            {approvalStatus === "rejected" && (
              <button
                type="button"
                onClick={() => navigate("/shopkeeper/onboarding/documents")}
                className="btn-outline mt-3 w-full"
              >
                Update documents and resubmit
              </button>
            )}
            {approvalStatus === "approved" && (
              <button
                type="button"
                onClick={() => navigate("/shopkeeper/dashboard")}
                className="btn-outline mt-3 w-full"
              >
                Go to dashboard
              </button>
            )}
            <p className="mt-3 text-center text-[11px] text-(--color-text-muted)">
              Approval status comes from the NearMart admin panel. Update the documents and resubmit if your
              application is rejected.
            </p>
          </aside>
        </div>
      </div>
    </ShopOnboardingLayout>
  );
};

export default ShopApproval;