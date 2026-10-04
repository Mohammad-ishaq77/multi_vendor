import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Info, Loader2, MapPin, PackageCheck, Phone, Store, XCircle } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useToast } from "../components/Toast";

export default function PickupVerification() {
  const navigate = useNavigate();
  const { activeDelivery, verifyPickup } = useDeliveryPartner();
  const { addToast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  if (!activeDelivery) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-gray-500">No active delivery to verify.</p>
        <button onClick={() => navigate("/delivery/active")} className="mt-4 text-sm text-emerald-600 font-semibold hover:underline">
          Go to Active Delivery
        </button>
      </div>
    );
  }

  const handleConfirm = async () => {
    setVerifying(true);
    const res = await verifyPickup();
    setVerifying(false);
    setResult(res);
    addToast(res.message, res.success ? "success" : "error");
    if (res.success) {
      setTimeout(() => navigate("/delivery/pickup-confirmed"), 1200);
    }
  };

  return (
    <div className="w-full space-y-4">
      <button onClick={() => navigate("/delivery/active")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Confirm pickup</h1>
          <p className="text-sm text-gray-500 mt-1">Collect the parcel from {activeDelivery.shopName}</p>
        </div>

        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{activeDelivery.shopName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                {activeDelivery.shopAddress || "Address not set"}
                {activeDelivery.shopPhone && (
                  <>
                    <span>·</span>
                    <Phone className="w-3 h-3" />
                    {activeDelivery.shopPhone}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-md p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              NearMart does not issue pickup codes, so there is nothing to type here. Confirming marks the
              delivery as picked up on the server and notifies the shop and the customer.
            </span>
          </div>

          <div className="rounded-md border border-gray-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Order</p>
            <p className="mt-1 break-all text-sm font-semibold text-gray-900">{activeDelivery.id}</p>
            <p className="mt-1 text-xs text-gray-500">
              {activeDelivery.items?.length || 0} item(s) · ₹{Number(activeDelivery.orderAmount || 0).toLocaleString("en-IN")}
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
            onClick={handleConfirm}
            disabled={verifying || result?.success}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                Confirm pickup
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}