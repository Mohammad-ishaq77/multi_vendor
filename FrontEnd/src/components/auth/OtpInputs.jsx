import { useEffect, useRef } from "react";

export default function OtpInputs({
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = true,
  onComplete,
}) {
  const inputsRef = useRef([]);
  const digits = Array.isArray(value) ? value : Array.from({ length: 6 }, (_, i) => value?.[i] || "");

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
    if (char && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    update(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={`Digit ${index + 1}`}
            className={`h-12 w-10 rounded-[12px] border text-center text-lg font-bold outline-none transition sm:h-14 sm:w-12 ${
              error
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : digit
                  ? "border-[var(--color-primary)] bg-[var(--color-green-bg)] text-[var(--color-primary-dark)]"
                  : "border-[#dce8e2] bg-[#f8fbf9] text-[var(--color-text)]"
            } focus:border-[var(--color-green)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-center text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
