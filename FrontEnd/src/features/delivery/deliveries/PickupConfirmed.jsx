import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Lock, AlertTriangle } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function PickupConfirmed() {
  const navigate = useNavigate();
  const { activeDelivery, startDelivery } = useDeliveryPartner();

  if (!activeDelivery) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-gray-500">No active delivery.</p>
        <button onClick={() => navigate("/delivery/dashboard")} className="mt-4 text-sm text-emerald-600 font-semibold hover:underline">Go to Dashboard</button>
      </div>
    );
  }

  const handleStartDelivery = () => {
    startDelivery();
    navigate("/delivery/active");
  };

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <h1 className="text-xl font-bold text-gray-900">Pickup Confirmed</h1>
          <p className="text-sm text-gray-500 mt-1">Package received in sealed condition</p>
        </div>

        <div className="px-8 pb-8 space-y-4">
          {/* Package Status */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <Package className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Package Status: <span className="text-emerald-600">SEALED</span></p>
              <p className="text-xs text-gray-400">{activeDelivery.items.length} item(s) · ₹{activeDelivery.orderAmount}</p>
            </div>
          </div>

          {/* Important Message */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Important</p>
              <p className="text-xs text-amber-600 mt-0.5">This package was sealed by the shopkeeper. Do not open or modify the package during transportation.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-800">NearMart Rule</p>
              <p className="text-xs text-rose-600 mt-0.5">Opening, modifying, or tampering with sealed packages is strictly prohibited and will result in immediate account suspension.</p>
            </div>
          </div>

          {/* Delivery Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Order ID</span><span className="font-medium text-gray-700">{activeDelivery.id}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">To</span><span className="font-medium text-gray-700">{activeDelivery.customerName}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Distance</span><span className="font-medium text-gray-700">{activeDelivery.distance} km</span></div>
          </div>

          <button onClick={handleStartDelivery} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">
            Start Delivery <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
