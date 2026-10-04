import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ChevronRight, Plus, Search, CheckCircle2, Loader2, Store } from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";
import ShopOnboardingLayout from "./ShopOnboardingLayout";

const ShopTypeSelection = () => {
  const navigate = useNavigate();
  const { shop, setShop, setOnboardingStep, shopTypes, loading } = useShopkeeper();
  const [selected, setSelected] = useState(
    () => shopTypes.find((type) => type.id === shop.categoryId) || null
  );
  const [customType, setCustomType] = useState(shop.name ? "" : "");
  const [isCustom, setIsCustom] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(
    () =>
      shopTypes.filter((type) => type.name.toLowerCase().includes(searchQuery.trim().toLowerCase())),
    [shopTypes, searchQuery]
  );

  const handleSelect = (type) => {
    setSelected(type);
    setIsCustom(false);
    setCustomType("");
    setError("");
  };

  const handleCustom = () => {
    setIsCustom(true);
    setSelected(null);
    setError("");
  };

  const handleProceed = async () => {
    if (!isCustom && !selected) {
      setError("Select a shop category");
      return;
    }
    setSubmitting(true);
    // Categories are server rows, so the real categoryId travels with the shop.
    const result = await setShop({
      type: isCustom ? customType.trim() : selected?.name,
      categoryId: isCustom ? null : selected?.id,
    });
    setSubmitting(false);
    if (!result?.ok) {
      setError(result?.error || "We could not save your selection.");
      return;
    }
    setOnboardingStep("create_shop");
    navigate("/shopkeeper/onboarding/create-shop");
  };

  const selectedMeta = isCustom
    ? {
        name: customType || "Custom type",
        description: "Describe your shop on the next screen; admins review it before approval.",
      }
    : selected
      ? { name: selected.name, description: "Customers browsing this category will see your shop." }
      : null;

  return (
    <ShopOnboardingLayout stepKey="type_selection">
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-(--color-green-bg) text-(--color-primary)">
              <Store className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">What do you sell?</h1>
            <p className="mt-1 max-w-xl text-sm text-(--color-text-muted)">
              Choose the aisle that fits your shop. Customers will find you faster.
            </p>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grocery, pharmacy, bakery..."
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {loading && shopTypes.length === 0 && (
              <div className="col-span-full flex items-center gap-2 rounded-[16px] border border-[#dce8e2] bg-[#f8fbf9] px-4 py-6 text-sm text-(--color-text-muted)">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading categories from NearMart...
              </div>
            )}
            {filtered.map((type, index) => {
              const Icon = LucideIcons[type.icon] || Store;
              const active = selected?.id === type.id;
              return (
                <motion.button
                  key={type.id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleSelect(type)}
                  className={`relative flex items-start gap-3 rounded-[16px] border p-4 text-left transition-all ${
                    active
                      ? "border-(--color-primary) bg-(--color-green-bg) shadow-[var(--shadow-card)]"
                      : "border-[#dce8e2] bg-white hover:-translate-y-0.5 hover:border-(--color-green-soft) hover:shadow-[var(--shadow-card)]"
                  }`}
                >
                  {active && (
                    <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-(--color-primary)" />
                  )}
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${
                      active ? "bg-white text-(--color-primary)" : "bg-(--color-green-bg) text-(--color-primary)"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 pr-5">
                    <span className="block text-sm font-semibold text-(--color-text)">{type.name}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-(--color-text-muted)">
                      {type.description || `Sell ${type.name.toLowerCase()} products`}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleCustom}
            className={`flex items-start gap-3 rounded-[16px] border border-dashed p-4 text-left transition-all ${
              isCustom
                ? "border-(--color-primary) bg-(--color-green-bg)"
                : "border-[#dce8e2] bg-white hover:border-(--color-primary)"
            }`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-white text-(--color-primary)">
              <Plus className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Use another category</span>
              <span className="mt-0.5 block text-xs text-(--color-text-muted)">
                Skip the category and describe your shop on the next screen.
              </span>
            </span>
          </button>
        </div>

        {!loading && shopTypes.length === 0 && (
          <div className="mt-4 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No product categories are published yet. You can still continue — an admin can assign your category
            later.
          </div>
        )}

        {shopTypes.length > 0 && filtered.length === 0 && (
          <p className="mt-4 text-sm text-(--color-text-muted)">
            No categories match “{searchQuery}”.
          </p>
        )}

        <AnimatePresence>
          {isCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-[16px] border border-[#dce8e2] bg-[#f8fbf9] p-4 sm:p-5">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Custom shop type</label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g. Pet store, Sports equipment"
                  className="input-field"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedMeta?.name && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-[16px] border border-(--color-green-soft) bg-(--color-green-bg) px-4 py-3.5 sm:px-5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-(--color-primary-dark)">{selectedMeta.name}</p>
              <p className="mt-0.5 text-xs text-(--color-text-muted)">{selectedMeta.description}</p>
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button type="button" onClick={handleProceed} disabled={submitting} className="btn-primary shrink-0">
              {submitting ? "Saving..." : "Continue"}
              {!submitting && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        )}

        {!selectedMeta?.name && (
          <div className="mt-5 flex items-center justify-between gap-4">
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button type="button" onClick={handleProceed} disabled={submitting} className="btn-primary ml-auto">
              {submitting ? "Saving..." : "Continue to shop details"}
              {!submitting && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    </ShopOnboardingLayout>
  );
};

export default ShopTypeSelection;
