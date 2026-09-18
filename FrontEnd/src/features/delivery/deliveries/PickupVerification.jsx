import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Hash, ArrowLeft, CheckCircle, XCircle, Store, MapPin, Phone } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useToast } from "../components/Toast";

export default function PickupVerification() {
  const navigate = useNavigate();
  const { activeDelivery, verifyPickup } = useDeliveryPartner();
  const { addToast } = useToast();
  const [orderId, setOrderId] = useState("");
  const [pickupCode, setPickupCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [method, setMethod] = useState("code");

  if (!activeDelivery) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-gray-500">No active delivery to verify.</p>
        <button onClick={() => navigate("/delivery/active")} className="mt-4 text-sm text-emerald-600 font-semibold hover:underline">Go to Active Delivery</button>
      </div>
    );
  }

  const handleVerify = () => {
    if (method === "code") {
      if (!orderId.trim() || !pickupCode.trim()) {
        addToast("Please enter both Order ID and Pickup Code.", "error");
        return;
      }
      if (orderId.trim() !== activeDelivery.id) {
        addToast("Order ID does not match.", "error");
        return;
      }
    }

    setVerifying(true);
    setTimeout(() => {
      const res = verifyPickup(pickupCode || activeDelivery.pickupVerificationCode);
      setResult(res);
      setVerifying(false);
      if (res.success) {
        addToast(res.message, "success");
        setTimeout(() => navigate("/delivery/pickup-confirmed"), 1200);
      } else {
        addToast(res.message, "error");
      }
    }, 1200);
  };

  const handleSimulateQR = () => {
    setVerifying(true);
    setTimeout(() => {
      const res = verifyPickup(activeDelivery.pickupVerificationCode);
      setResult(res);
      setVerifying(false);
      if (res.success) {
        addToast("QR scan verified successfully.", "success");
        setTimeout(() => navigate("/delivery/pickup-confirmed"), 1200);
      }
    }, 1500);
  };

  return (
    <div className="w-full space-y-4">
      <button onClick={() => navigate("/delivery/active")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Pickup Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Verify the package before pickup</p>
        </div>

        {/* Shop Info */}
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{activeDelivery.shopName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />{activeDelivery.shopAddress}
                <span>·</span>
                <Phone className="w-3 h-3" />{activeDelivery.shopPhone}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Method Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button onClick={() => setMethod("code")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${method === "code" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              <Hash className="w-4 h-4" /> Pickup Code
            </button>
            <button onClick={() => setMethod("qr")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${method === "qr" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              <QrCode className="w-4 h-4" /> Scan QR
            </button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-3 p-4 rounded-xl border ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
              {result.success ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}
              <p className={`text-sm font-medium ${result.success ? "text-emerald-800" : "text-rose-800"}`}>{result.message}</p>
            </motion.div>
          )}

          {method === "code" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={activeDelivery.id} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Code</label>
                <input type="text" value={pickupCode} onChange={(e) => setPickupCode(e.target.value)} placeholder="Enter pickup code" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                <p className="text-[0.65rem] text-gray-400 mt-1">Ask the shop for the pickup code</p>
              </div>
              <button onClick={handleVerify} disabled={verifying || result?.success} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50">
                {verifying ? "Verifying..." : "Verify Pickup"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <QrCode className="w-16 h-16 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">QR Scanner (Simulated)</p>
                <p className="text-xs text-gray-400 mt-1">Position camera to scan shop QR</p>
              </div>
              <button onClick={handleSimulateQR} disabled={verifying || result?.success} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50">
                {verifying ? "Scanning..." : "Simulate QR Scan"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
