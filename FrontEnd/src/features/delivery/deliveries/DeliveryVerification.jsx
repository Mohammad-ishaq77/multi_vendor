import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Info,
  Loader2,
  Mail,
  MapPin,
  PackageCheck,
  RefreshCw,
  User,
} from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useToast } from "../components/Toast";
import OtpInputs from "../../../components/auth/OtpInputs";
import useCountdown from "../../../hooks/useCountdown";

const RESEND_COOLDOWN_SECONDS = 30;
const EMPTY_DIGITS = Array.from({ length: 6 }, () => "");

export default function DeliveryVerification() {
  const navigate = useNavigate();
  const { activeDelivery, requestDeliveryOtp, completeDelivery } = useDeliveryPartner();
  const { addToast } = useToast();
  const countdown = useCountdown();

  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [digits, setDigits] = useState(EMPTY_DIGITS);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const verificationInProgress = useRef(false);

  if (!activeDelivery) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-gray-500">No active delivery.</p>
        <button onClick={() => navigate("/delivery/dashboard")} className="mt-4 text-sm text-emerald-600 font-semibold hover:underline">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const code = digits.join("");
  const isComplete = /^\d{6}$/.test(code);

  const handleSendCode = async () => {
    setSending(true);
    const res = await requestDeliveryOtp();
    setSending(false);
    setResult(res);
    addToast(res.message, res.success ? "success" : "error");
    if (res.success) {
      setMaskedEmail(res.data?.maskedEmail || "");
      setDemoOtp(res.data?.demoOtp || "");
      setDigits(EMPTY_DIGITS);
      countdown.start(RESEND_COOLDOWN_SECONDS);
    }
  };

  const handleComplete = async (submittedCode = code) => {
    if (verificationInProgress.current) return;
    const value = String(submittedCode).trim();
    if (!/^\d{6}$/.test(value)) {
      setResult({ success: false, message: "Enter the 6-digit code the customer received." });
      return;
    }

    verificationInProgress.current = true;
    setVerifying(true);
    try {
      const res = await completeDelivery(value);
      setResult(res);
      addToast(res.message, res.success ? "success" : "error");
      if (res.success) {
        setDigits(EMPTY_DIGITS);
        navigate("/delivery/completed", {
          state: {
            delivery: {
              id: activeDelivery.id,
              partnerEarning: activeDelivery.partnerEarning ?? activeDelivery.assignment?.partnerEarning,
              distance: activeDelivery.distance,
              estimatedTime: activeDelivery.estimatedTime,
            },
          },
        });
      }
    } finally {
      verificationInProgress.current = false;
      setVerifying(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <button onClick={() => navigate("/delivery/active")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Complete delivery</h1>
          <p className="text-sm text-gray-500 mt-1">Hand the parcel to {activeDelivery.customerName || "the customer"}</p>
        </div>

        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-rose-100 flex items-center justify-center text-rose-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{activeDelivery.customerName || "Customer"}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                {activeDelivery.customerAddress || "Address not set"}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-md p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              {demoOtp
                ? "Use the demo confirmation code shown below to complete this delivery."
                : "The customer receives a 6-digit code by email once you request it. Ask them for it at the door and enter it below."}{" "}
              On success the order is marked delivered, your earnings are credited and the customer&apos;s tracking updates.
            </span>
          </div>

          {demoOtp && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800">
              Demo delivery code: <span className="font-bold tracking-wider">{demoOtp}</span>
            </p>
          )}

          <div className="rounded-md border border-gray-100 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-emerald-600" />
                {demoOtp ? (
                  <span>Demo code ready</span>
                ) : maskedEmail ? (
                  <span>
                    Code sent to <span className="font-semibold">{maskedEmail}</span>
                  </span>
                ) : (
                  <span>No code sent yet</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending || countdown.isRunning}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {countdown.isRunning ? `Resend in ${countdown.secondsLeft}s` : maskedEmail ? "Resend code" : "Send code"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="delivery-otp" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Customer delivery code
            </label>
            <OtpInputs
              value={digits}
              onChange={(next) => {
                setDigits(next);
                if (result && !result.success) setResult(null);
              }}
              error={result && !result.success ? result.message : ""}
              disabled={verifying}
              autoFocus
              onComplete={(submittedCode) => handleComplete(submittedCode)}
            />
          </div>

          {result?.success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 rounded-md border bg-emerald-50 border-emerald-200"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-800">{result.message}</p>
            </motion.div>
          )}

          <button
            onClick={() => handleComplete()}
            disabled={verifying || result?.success || !isComplete}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                Verify code and complete delivery
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
