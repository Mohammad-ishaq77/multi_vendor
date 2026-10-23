import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Lock, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import BrandLogo from "../../../components/common/BrandLogo";
import AuthCloseButton from "../../../components/common/AuthCloseButton";
import OtpInputs from "../../../components/auth/OtpInputs";
import { useToast } from "../../../components/common/Toast";
import authService from "../../../services/authService";
import useCountdown from "../../../hooks/useCountdown";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 30;
const EMPTY_DIGITS = Array.from({ length: 6 }, () => "");

const STEPS = [
  { id: "email", label: "Email", icon: Mail },
  { id: "otp", label: "Code", icon: ShieldCheck },
  { id: "password", label: "New password", icon: KeyRound },
];

const StepIndicator = ({ current }) => (
  <ol className="mb-8 flex items-center justify-center gap-2" aria-label="Progress">
    {STEPS.map((step, index) => {
      const active = step.id === current;
      const done = STEPS.findIndex((s) => s.id === current) > index;
      const Icon = step.icon;
      return (
        <li key={step.id} className="flex items-center gap-2">
          <span
            className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${
              active
                ? "bg-(--color-primary) text-white"
                : done
                  ? "bg-(--color-green-bg) text-(--color-primary)"
                  : "bg-[#eef4f1] text-(--color-text-muted)"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{step.label}</span>
          </span>
          {index < STEPS.length - 1 && <span className="h-px w-4 bg-[#dce8e2]" />}
        </li>
      );
    })}
  </ol>
);

const FieldError = ({ message }) =>
  message ? (
    <p className="rounded-[12px] border border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm text-rose-700" role="alert">
      {message}
    </p>
  ) : null;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const countdown = useCountdown();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(EMPTY_DIGITS);
  const [resetToken, setResetToken] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const otpCheckInProgress = useRef(false);

  const code = digits.join("");
  const isCodeComplete = /^\d{6}$/.test(code);

  const startResendCooldown = () => countdown.start(RESEND_COOLDOWN_SECONDS);

  const submitEmail = async (event) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setFieldError("Enter a valid email address.");
      return;
    }
    setFieldError("");
    setIsBusy(true);
    try {
      const result = await authService.forgotPassword({ email: trimmed });
      if (!result.ok) {
        setFieldError(result.error);
        return;
      }

      // The backend always answers the same way, so nothing here may hint at
      // whether an account exists.
      setDemoOtp(result.demoOtp || "");
      showToast(
        result.demoOtp
          ? `Demo reset code: ${result.demoOtp}`
          : "If that email is registered, a reset code is on its way."
      );
      setStep("otp");
      startResendCooldown();
    } catch (error) {
      setFieldError(error?.message || "We could not send the reset code right now.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleResend = async () => {
    if (countdown.isRunning || isBusy) return;
    setIsBusy(true);
    const result = await authService.forgotPassword({ email: email.trim().toLowerCase() });
    setIsBusy(false);
    if (!result.ok) {
      setFieldError(result.error);
      return;
    }
    setDigits(EMPTY_DIGITS);
    setDemoOtp(result.demoOtp || "");
    setFieldError("");
    startResendCooldown();
    showToast(result.demoOtp ? `Demo reset code: ${result.demoOtp}` : "A new reset code is on its way.");
  };

  const runOtpCheck = async (submittedCode = code) => {
    if (otpCheckInProgress.current || isBusy) return;
    if (!/^\d{6}$/.test(submittedCode)) {
      setFieldError("Enter the 6-digit verification code.");
      return;
    }
    setFieldError("");
    otpCheckInProgress.current = true;
    setIsBusy(true);
    try {
      const result = await authService.verifyResetOtp({
        email: email.trim().toLowerCase(),
        otp: submittedCode,
      });
      if (!result.ok || !result.resetToken) {
        setFieldError(result.error || "That code could not be verified.");
        return;
      }

      setResetToken(result.resetToken);
      setStep("password");
    } catch (error) {
      setFieldError(error?.message || "That code could not be verified.");
    } finally {
      otpCheckInProgress.current = false;
      setIsBusy(false);
    }
  };

  const submitOtp = (event) => {
    event.preventDefault();
    runOtpCheck();
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < 4) {
      setFieldError("Password must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError("Passwords do not match.");
      return;
    }
    setFieldError("");
    setIsBusy(true);
    const result = await authService.resetPassword({
      email: email.trim().toLowerCase(),
      resetToken,
      newPassword,
    });
    setIsBusy(false);

    if (!result.ok) {
      setFieldError(result.error);
      return;
    }

    showToast("Password updated. Please sign in with your new password.");
    navigate("/login", { replace: true });
  };

  const inputErrorClass = fieldError ? "border-rose-300 bg-rose-50/70 focus:border-rose-400" : "";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--color-surface-tint) px-4 py-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-(--color-green-soft) blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-(--color-green-light)/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-[24px] border border-white/70 bg-white/80 px-5 py-10 shadow-[var(--shadow-hover)] backdrop-blur-xl sm:px-10"
      >
        <AuthCloseButton className="right-4 top-4" />

        <div className="mb-2 flex flex-col items-center text-center">
          <div className="mb-4 lg:hidden">
            <BrandLogo />
          </div>
          <h1 className="font-display text-[1.7rem] font-bold tracking-tight">Forgot your password?</h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-(--color-text-muted)">
            We'll send a 6-digit code to confirm it's you, then you can set a new password.
          </p>
        </div>

        <StepIndicator current={step} />

        {step === "email" && (
          <form onSubmit={submitEmail} className="space-y-5" noValidate>
            <div>
              <label htmlFor="forgot-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldError) setFieldError("");
                  }}
                  placeholder="name@example.com"
                  className={`input-field pl-11 ${inputErrorClass}`}
                  autoFocus
                />
              </div>
            </div>

            <FieldError message={fieldError} />

            <button type="submit" disabled={isBusy} className="btn-primary w-full">
              {isBusy ? "Sending..." : "Send reset code"}
              {!isBusy && <ArrowRight className="h-4 w-4" />}
            </button>

            <p className="text-center text-sm text-(--color-text-muted)">
              Remembered it?{" "}
              <Link to="/login" className="font-semibold text-(--color-primary)">
                Back to sign in
              </Link>
            </p>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={submitOtp} className="space-y-6" noValidate>
            <p className="text-center text-sm text-(--color-text-muted)">
              {demoOtp ? (
                <>Use the demo code below to confirm your identity for <span className="font-semibold text-(--color-text)">{email}</span>.</>
              ) : (
                <>Enter the code sent to <span className="font-semibold text-(--color-text)">{email}</span>.</>
              )}
            </p>

            {demoOtp && (
              <p className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800">
                Demo verification code: <span className="font-bold tracking-wider">{demoOtp}</span>
              </p>
            )}

            <OtpInputs
              value={digits}
              onChange={(next) => {
                setDigits(next);
                if (fieldError) setFieldError("");
              }}
              error={fieldError}
              disabled={isBusy}
              autoFocus
              onComplete={(completedCode) => runOtpCheck(completedCode)}
            />

            <button type="submit" disabled={!isCodeComplete || isBusy} className="btn-primary w-full">
              {isBusy ? "Checking..." : "Verify code"}
              {!isBusy && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="flex flex-col items-center gap-2 text-sm text-(--color-text-muted)">
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown.isRunning || isBusy}
                className="inline-flex items-center gap-2 font-semibold text-(--color-primary) disabled:cursor-not-allowed disabled:text-(--color-text-muted)"
              >
                <RefreshCw className={`h-4 w-4 ${isBusy ? "animate-spin" : ""}`} />
                {countdown.isRunning ? `Resend in ${countdown.secondsLeft}s` : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setFieldError("");
                  setDigits(EMPTY_DIGITS);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-text-muted) hover:text-(--color-primary)"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Use a different email
              </button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={submitPassword} className="space-y-5" noValidate>
            <div>
              <label htmlFor="forgot-new-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                New password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                <input
                  id="forgot-new-password"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldError) setFieldError("");
                  }}
                  placeholder="Enter a new password"
                  className={`input-field pl-11 pr-12 ${inputErrorClass}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNew((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-(--color-text-muted) hover:text-(--color-primary)"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="forgot-confirm-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                <input
                  id="forgot-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldError) setFieldError("");
                  }}
                  placeholder="Repeat new password"
                  className={`input-field pl-11 pr-12 ${inputErrorClass}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-(--color-text-muted) hover:text-(--color-primary)"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <FieldError message={fieldError} />

            <button type="submit" disabled={isBusy} className="btn-primary w-full">
              {isBusy ? "Updating..." : "Update password"}
              {!isBusy && <ArrowRight className="h-4 w-4" />}
            </button>

            <p className="text-center text-xs text-(--color-text-muted)">
              This code can be used once and expires soon.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
