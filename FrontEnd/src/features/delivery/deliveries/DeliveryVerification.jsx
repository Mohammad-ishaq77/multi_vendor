import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Info, Loader2, MapPin, PackageCheck, User, XCircle } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useToast } from "../components/Toast";

export default function DeliveryVerification() {
  const navigate = useNavigate();
  const { activeDelivery, completeDelivery } = useDeliveryPartner();
  const { addToast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [otp, setOtp] = useState("");

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

  const handleComplete = async () => {
    if (otp !== "1234") {
      const invalidResult = { success: false, message: "Enter the valid 4-digit demo OTP." };
      setResult(invalidResult);
      addToast(invalidResult.message, "error");
      return;
    }

    setVerifying(true);
    const res = await completeDelivery();
    setVerifying(false);
    setResult(res);
    addToast(res.message, res.success ? "success" : "error");
    if (res.success) {
      setTimeout(() => navigate("/delivery/completed"), 1200);
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
              Enter the customer&apos;s 4-digit delivery OTP. For this demo, use <strong className="text-gray-700">1234</strong>.
              Successful verification marks the order delivered, credits your earnings and updates the order status.
            </span>
          </div>

          <div>
            <label htmlFor="delivery-otp" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Customer delivery OTP
            </label>
            <input
              id="delivery-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 4));
                setResult(null);
              }}
              placeholder="Enter 4-digit OTP"
              aria-describedby="delivery-otp-hint"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-center text-xl font-semibold tracking-[0.5em] text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p id="delivery-otp-hint" className="mt-2 text-xs text-gray-500">
              Demo OTP: <span className="font-semibold tracking-widest text-emerald-700">1234</span>
            </p>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center gap-3 p-4 rounded-md border ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
              <p className={`text-sm font-medium ${result.success ? "text-emerald-800" : "text-rose-800"}`}>
                {result.message}
              </p>
            </motion.div>
          )}

          <button
            onClick={handleComplete}
            disabled={verifying || result?.success || otp.length !== 4}
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
                Verify OTP and complete delivery
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}