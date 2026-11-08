import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ORBIT_TRANSITION = { repeat: Infinity, duration: 5.5, ease: "linear", delay: 0.75 };
const SETTLE_TRANSITION = { duration: 0.45, ease: "easeOut" };
const ROW_LEFT = [20, 40, 60, 80];
const CIRCLE_RADIUS = 34;

const VerifyingLabel = () => (
  <motion.div
    key="verifying"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className="flex flex-col items-center gap-1 text-(--color-primary)"
    role="status"
    aria-live="polite"
  >
    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-(--color-green-bg)">
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-(--color-primary)/40"
        animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
      />
      <motion.span
        className="h-2.5 w-2.5 rounded-full bg-(--color-primary)"
        animate={{ scale: [1, 1.35, 1] }}
        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
      />
    </span>
    <span className="text-[10px] font-semibold uppercase tracking-wider">Verifying</span>
  </motion.div>
);

const VerifiedBadge = () => (
  <motion.div
    key="verified"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.18 }}
    className="flex flex-col items-center gap-1"
    role="status"
    aria-live="polite"
  >
    <motion.span
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 16 }}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary) text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)]"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <motion.path
          d="M5 12.5l4.2 4.2L19 7"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.4, ease: "easeOut" }}
        />
      </svg>
    </motion.span>
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-[10px] font-semibold uppercase tracking-wider text-(--color-primary-dark)"
    >
      OTP verified
    </motion.span>
  </motion.div>
);

export default function OtpInputs({
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = true,
  onComplete,
  status = "idle",
  length = 4,
}) {
  const inputsRef = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const digits = Array.isArray(value) ? value : Array.from({ length }, (_, i) => value?.[i] || "");
  const isVerifying = status === "verifying";
  const isVerified = status === "verified";
  const isCircular = isVerifying || isVerified;
  const isLocked = disabled || isVerifying || isVerified;

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const update = (next) => {
    onChange(next);
    if (next.every(Boolean) && onComplete) onComplete(next.join(""));
  };

  const handleChange = (index, raw) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    update(next);
    if (char && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = pasted.split("").concat(Array(length).fill("")).slice(0, length);
    update(next);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div>
      <motion.div
        className="relative mx-auto w-full max-w-[280px]"
        animate={{ height: isCircular ? 280 : 56 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        onPaste={handlePaste}
      >
        {/* Orbit guide shown once the boxes move into a circle */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-[16%] rounded-full border border-dashed border-[#cfe6dc]"
          animate={{ opacity: isCircular ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* The boxes orbit inside this rotating layer while verifying */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: isVerifying ? 360 : 0 }}
          transition={isVerifying ? ORBIT_TRANSITION : SETTLE_TRANSITION}
        >
          {digits.map((digit, index) => {
            const angle = (index / length) * Math.PI * 2 - Math.PI / 2;
            const rowLeft = ROW_LEFT[index] ?? 50;
            const left = isCircular ? 50 + Math.cos(angle) * CIRCLE_RADIUS : rowLeft;
            const top = isCircular ? 50 + Math.sin(angle) * CIRCLE_RADIUS : 50;
            const isFocused = focusedIndex === index;

            return (
              <div
                key={index}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out ${
                  isVerified ? "opacity-40" : ""
                }`}
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, rotate: -120 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 20 }}
                >
                  <motion.div
                    animate={{
                      rotate: isVerifying ? -360 : 0,
                      scale: isFocused ? 1.14 : 1,
                    }}
                    transition={{
                      rotate: isVerifying ? ORBIT_TRANSITION : SETTLE_TRANSITION,
                      scale: { type: "spring", stiffness: 420, damping: 20 },
                    }}
                  >
                    <input
                      ref={(node) => {
                        inputsRef.current[index] = node;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={digit}
                      disabled={isLocked}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(-1)}
                      aria-label={`Digit ${index + 1}`}
                      className={`h-12 w-9 min-w-0 rounded-2xl border text-center text-lg font-bold outline-none transition-shadow sm:h-14 sm:w-12 ${
                        error
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : isVerified || digit
                            ? "border-(--color-primary) bg-(--color-green-bg) text-(--color-primary-dark)"
                            : "border-[#dce8e2] bg-[#f8fbf9] text-(--color-text)"
                      } ${
                        isFocused
                          ? "border-(--color-green) bg-white shadow-[0_0_0_4px_rgba(16,185,129,0.14)]"
                          : ""
                      }`}
                    />
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Center status: orbit label, then the verified tick */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isVerifying && <VerifyingLabel key="verifying" />}
            {!isVerifying && isVerified && <VerifiedBadge key="verified" />}
          </AnimatePresence>
        </div>
      </motion.div>
      {error && (
        <p className="mt-2 text-center text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
