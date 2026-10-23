import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MailCheck, RefreshCw } from "lucide-react";
import BrandLogo from "../../../components/common/BrandLogo";
import AuthCloseButton from "../../../components/common/AuthCloseButton";
import OtpInputs from "../../../components/auth/OtpInputs";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../components/common/Toast";
import { APP_CONFIG } from "../../../config/appConfig";
import useCountdown from "../../../hooks/useCountdown";

const RESEND_COOLDOWN_SECONDS = 30;
const EMPTY_DIGITS = Array.from({ length: 6 }, () => "");

/** Local part hidden, domain kept — enough to recognise your own inbox. */
const maskEmail = (email) => {
  const value = String(email || "").trim();
  const at = value.indexOf("@");
  if (at <= 0) return value;
  return `${value.slice(0, 1)}${"*".repeat(Math.max(value.slice(0, at).length - 1, 1))}${value.slice(at)}`;
};

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerification } = useAuth();
  const { showToast } = useToast();
  const countdown = useCountdown();

  // The email lives in navigation state (set by Register or Login). Query
  // params are used as a fallback so a refresh or a pasted link still works.
  const email = useMemo(() => {
    const fromState = location.state?.email;
    const fromQuery = new URLSearchParams(location.search).get("email");
    return String(fromState || fromQuery || "").trim();
  }, [location.state, location.search]);

  const [digits, setDigits] = useState(EMPTY_DIGITS);
  const [otpError, setOtpError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [demoOtp, setDemoOtp] = useState(location.state?.demoOtp || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const code = digits.join("");
  const isComplete = /^\d{6}$/.test(code);

  // Nothing to verify without an address — send the user back to sign up.
  if (!email) return <Navigate to="/register" replace />;

  const submit = async (value) => {
    const otp = value ?? code;
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit verification code.");
      return;
    }
    setIsVerifying(true);
    setOtpError("");
    setSubmitError("");

    const result = await verifyEmail({ email, otp });
    setIsVerifying(false);

    if (!result.ok) {
      setOtpError(result.error);
      setDigits(EMPTY_DIGITS);
      return;
    }

    showToast("Email verified. Welcome aboard!");
    navigate(result.redirectTo, { replace: true });
  };

  const handleResend = async () => {
    if (countdown.isRunning || isResending) return;
    setIsResending(true);
    const result = await resendVerification({ email });
    setIsResending(false);

    if (!result.ok) {
      setSubmitError(result.error);
      showToast(result.error, "error");
      return;
    }

    setSubmitError("");
    setDemoOtp(result.demoOtp || "");
    setOtpError("");
    setDigits(EMPTY_DIGITS);
    countdown.start(RESEND_COOLDOWN_SECONDS);
    showToast(
      result.demoOtp
        ? `Demo verification code: ${result.demoOtp}`
        : `If ${maskEmail(email)} is unverified, a new code is on its way.`
    );
  };

  const resendLabel = () => {
    if (isResending) return "Sending...";
    if (countdown.isRunning) return `Resend in ${countdown.secondsLeft}s`;
    return "Resend code";
  };

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

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 lg:hidden">
            <BrandLogo />
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-green-bg) text-(--color-primary)">
            <MailCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-[1.7rem] font-bold tracking-tight">Verify your email</h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-(--color-text-muted)">
            {demoOtp
              ? `Use the demo code below to activate your ${APP_CONFIG.name} account.`
              : <>We sent a 6-digit code to <span className="font-semibold text-(--color-text)">{maskEmail(email)}</span>. Enter it below to activate your {APP_CONFIG.name} account.</>}
          </p>
        </div>

        {demoOtp && (
          <p className="mb-5 rounded-[12px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800">
            Demo verification code: <span className="font-bold tracking-wider">{demoOtp}</span>
          </p>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="space-y-6"
          noValidate
        >
          <OtpInputs
            value={digits}
            onChange={(next) => {
              setDigits(next);
              if (otpError) setOtpError("");
            }}
            error={otpError}
            disabled={isVerifying}
            autoFocus
            onComplete={(value) => submit(value)}
          />

          {submitError && (
            <p
              className="rounded-[12px] border border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm text-rose-700"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <button type="submit" disabled={!isComplete || isVerifying} className="btn-primary w-full">
            {isVerifying ? "Verifying..." : "Verify email"}
            {!isVerifying && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 text-center text-sm text-(--color-text-muted)">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown.isRunning || isResending}
            className="inline-flex items-center gap-2 font-semibold text-(--color-primary) disabled:cursor-not-allowed disabled:text-(--color-text-muted)"
          >
            <RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
            {countdown.isRunning ? resendLabel() : "Didn't get the code? Resend"}
          </button>
          <p className="text-xs">
            Wrong address?{" "}
            <Link to="/register" className="font-semibold text-(--color-primary)">
              Use a different email
            </Link>
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-text-muted) hover:text-(--color-primary)"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
