import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import BrandLogo from "../common/BrandLogo";

export default function OnboardingShell({
  steps = [],
  currentIndex = 0,
  onBack,
  backLabel = "Back",
  children,
  hideSteps = false,
}) {
  const safeIndex = Math.max(0, currentIndex);
  const progress = steps.length ? ((safeIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-(--color-surface-tint)">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-(--color-green-soft) blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-(--color-green-light)/20 blur-3xl" />

      <div className="container-app relative z-10 py-6 sm:py-8 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center justify-between gap-3"
        >
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-(--color-green-soft) bg-white px-3.5 py-2 text-sm font-medium text-(--color-text-muted) shadow-[var(--shadow-card)] hover:text-(--color-primary)"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </button>
          ) : (
            <span />
          )}
          <BrandLogo size={36} subtitle="" />
        </motion.div>

        {!hideSteps && steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-[16px] border border-white/70 bg-white/80 px-4 py-3.5 shadow-[var(--shadow-card)] backdrop-blur-xl sm:px-5"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-primary)">
                Step {safeIndex + 1} of {steps.length}
              </p>
              <p className="text-xs font-medium text-(--color-text-muted)">{steps[safeIndex]?.label}</p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-(--color-green-bg)">
              <motion.div
                className="h-full rounded-full bg-(--color-primary)"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </div>
            <div className="mt-3 hidden gap-2 sm:flex">
              {steps.map((step, index) => {
                const done = index < safeIndex;
                const active = index === safeIndex;
                return (
                  <div key={step.label} className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        done
                          ? "bg-(--color-primary) text-white"
                          : active
                            ? "bg-(--color-green-bg) text-(--color-primary-dark) ring-2 ring-(--color-primary)"
                            : "bg-[#eef4f0] text-(--color-text-muted)"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span
                      className={`truncate text-xs ${
                        active ? "font-semibold text-(--color-text)" : "text-(--color-text-muted)"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[var(--shadow-hover)] backdrop-blur-xl"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
