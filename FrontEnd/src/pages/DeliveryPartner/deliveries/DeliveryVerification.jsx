import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft, CheckCircle, XCircle, User, MapPin } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useToast } from "../components/Toast";

export default function DeliveryVerification() {
  const navigate = useNavigate();
  const { activeDelivery, verifyDeliveryOtp } = useDeliveryPartner();
  const { addToast } = useToast();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  if (!activeDelivery) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-gray-500">No active delivery.</p>
        <button onClick={() => navigate("/deliverypartner/dashboard")} className="mt-4 text-sm text-emerald-600 font-semibold hover:underline">Go to Dashboard</button>
      </div>
    );
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
      setOtp(newOtp);
      inputRefs[Math.min(pasted.length, 5)].current?.focus();
    }
  };

  const handleVerify = () => {
    const otpStr = otp.join("");
    if (otpStr.length !== 6) {
      addToast("Please enter the complete 6-digit OTP.", "error");
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      const res = verifyDeliveryOtp(otpStr);
      setResult(res);
      setVerifying(false);
      if (res.success) {
        addToast(res.message, "success");
        setTimeout(() => navigate("/deliverypartner/completed"), 1200);
      } else {
        addToast(res.message, "error");
        setOtp(["", "", "", "", "", ""]);
        inputRefs[0].current?.focus();
      }
    }, 1200);
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <button onClick={() => navigate("/deliverypartner/active")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Delivery Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the OTP provided by the customer</p>
        </div>

        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{activeDelivery.customerName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />{activeDelivery.customerAddress}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-3 p-4 rounded-xl border ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
              {result.success ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}
              <p className={`text-sm font-medium ${result.success ? "text-emerald-800" : "text-rose-800"}`}>{result.message}</p>
            </motion.div>
          )}

          <div className="flex justify-center gap-3">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            ))}
          </div>

          <p className="text-center text-xs text-gray-400">Ask the customer for the 6-digit delivery OTP</p>

          <button onClick={handleVerify} disabled={verifying || result?.success} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50">
            {verifying ? "Verifying..." : "Verify OTP"}
            {!verifying && <KeyRound className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
