import { useMemo, useRef, useState } from "react";
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
  Upload,
} from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";
import ShopOnboardingLayout from "./ShopOnboardingLayout";

const DOC_TYPES = [
  { type: "aadhaar", title: "Aadhaar Card", desc: "Identity of the shop owner", icon: Contact, required: true },
  { type: "pan", title: "PAN Card", desc: "Tax identity for payouts", icon: CreditCard, required: true },
  { type: "gst", title: "GST Certificate", desc: "Optional if your shop is GST registered", icon: Building2, required: false },
  { type: "license", title: "Shop / Trade License", desc: "Local municipal or trade license", icon: Store, required: true },
];

const MAX_BYTES = 8 * 1024 * 1024;

const ShopDocuments = () => {
  const navigate = useNavigate();
  const { shop, setOnboardingStep, documents, uploadDocument, actionError } = useShopkeeper();
  const inputs = useRef({});

  const [uploading, setUploading] = useState({});
  const [localError, setLocalError] = useState(null);

  const uploadedByType = useMemo(() => {
    const map = {};
    documents.forEach((doc) => {
      map[doc.type] = doc;
    });
    return map;
  }, [documents]);

  const missingRequired = DOC_TYPES.filter((doc) => doc.required && !uploadedByType[doc.type]);

  const handleFile = async (docType, file) => {
    setLocalError(null);
    if (!file) return;
    if (!/^(image\/|application\/pdf)/.test(file.type)) {
      setLocalError("Upload a PDF or an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("Each file must be 8 MB or smaller.");
      return;
    }

    setUploading((prev) => ({ ...prev, [docType]: true }));
    await uploadDocument(docType, file);
    setUploading((prev) => ({ ...prev, [docType]: false }));
    if (inputs.current[docType]) inputs.current[docType].value = "";
  };

  const handleSubmit = () => {
    if (missingRequired.length) {
      setLocalError(`Still required: ${missingRequired.map((d) => d.title).join(", ")}.`);
      return;
    }
    setOnboardingStep("approval");
    navigate("/shopkeeper/onboarding/approval");
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
            Upload the documents an admin reviews before {shop.name || "your shop"} goes live.
          </p>
        </div>

        {(localError || actionError) && (
          <div className="mb-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {localError || actionError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            {DOC_TYPES.map((doc) => {
              const record = uploadedByType[doc.type];
              const isBusy = Boolean(uploading[doc.type]);
              const Icon = doc.icon;
              return (
                <div key={doc.type} className="flex items-center gap-3 rounded-[16px] border border-(--color-border-soft) bg-(--color-surface-soft) p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-white text-(--color-primary)">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {doc.title}
                      {doc.required ? "" : " (optional)"}
                    </p>
                    <p className="truncate text-xs text-(--color-text-muted)">
                      {record ? `Uploaded: ${record.url}` : doc.desc}
                    </p>
                  </div>
                  <input
                    ref={(el) => {
                      inputs.current[doc.type] = el;
                    }}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(event) => handleFile(doc.type, event.target.files?.[0])}
                  />
                  <button
                    type="button"
                    className="btn-outline btn-sm shrink-0"
                    disabled={isBusy}
                    onClick={() => inputs.current[doc.type]?.click()}
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading
                      </>
                    ) : record ? (
                      <>
                        <Upload className="h-4 w-4" />
                        Replace
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload
                      </>
                    )}
                  </button>
                  {record && <CheckCircle2 className="h-5 w-5 shrink-0 text-(--color-primary)" />}
                </div>
              );
            })}

            {documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 rounded-[16px] border border-(--color-green-soft) bg-(--color-green-bg) p-4"
              >
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-(--color-primary)" />
                  <div>
                    <p className="text-sm font-semibold">{documents.length} document(s) recorded</p>
                    <p className="text-xs text-(--color-text-muted)">
                      An admin reviews these before your shop is approved.
                    </p>
                  </div>
                </div>
                {[
                  { icon: BadgeCheck, title: "Identity documents", desc: "Aadhaar and PAN attached" },
                  { icon: Building2, title: "Business proof", desc: "GST certificate and trade license attached" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-[12px] bg-white/70 p-3">
                    <item.icon className="h-4 w-4 text-(--color-primary)" />
                    <div>
                      <p className="text-xs font-semibold">{item.title}</p>
                      <p className="text-[11px] text-(--color-text-muted)">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <aside className="rounded-[16px] border border-(--color-green-soft) bg-(--color-green-bg)/60 p-5 lg:p-6">
            <p className="text-sm font-semibold">Review process</p>
            <p className="mt-1 text-xs leading-relaxed text-(--color-text-muted)">
              Documents are stored on the server and shown to NearMart admins with your application. Keep them
              clear and unexpired so approval is not delayed.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-(--color-text-muted)">
              Accepted formats: JPG, PNG or PDF, up to 8 MB each.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={missingRequired.length > 0}
              className="btn-primary mt-5 w-full"
            >
              Continue to approval status
            </button>
            {missingRequired.length > 0 && (
              <p className="mt-3 text-center text-[11px] text-(--color-text-muted)">
                Upload {missingRequired.map((d) => d.title).join(", ")} to continue.
              </p>
            )}
          </aside>
        </div>
      </div>
    </ShopOnboardingLayout>
  );
};

export default ShopDocuments;