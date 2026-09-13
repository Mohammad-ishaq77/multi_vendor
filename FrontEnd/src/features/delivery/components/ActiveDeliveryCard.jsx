import { motion } from "framer-motion";
import { MapPin, Clock, IndianRupee, Store, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ActiveDeliveryCard({ delivery }) {
  const navigate = useNavigate();
  if (!delivery) return null;

  const progressSteps = ["accepted", "pickup_verified", "picked_up", "out_for_delivery", "otp_verified", "completed"];
  const currentStepIndex = progressSteps.indexOf(delivery.status);
  const progress = currentStepIndex >= 0 ? ((currentStepIndex + 1) / progressSteps.length) * 100 : 0;

  const actionLabels = {
    accepted: { label: "Go to Pickup", path: "/delivery/pickup" },
    pickup_verified: { label: "Confirm Pickup", path: "/delivery/pickup-confirmed" },
    picked_up: { label: "Start Delivery", path: "/delivery/pickup-confirmed" },
    out_for_delivery: { label: "Verify OTP", path: "/delivery/verify" },
    otp_verified: { label: "Complete Delivery", path: "/delivery/completed" },
  };

  const action = actionLabels[delivery.status];

  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">{delivery.id}</p>
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Active Delivery
          </span>
        </div>
        <p className="text-lg font-bold text-emerald-600">₹{delivery.partnerEarning}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          />
        </div>
        <p className="text-[0.65rem] text-gray-400 mt-1">{delivery.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Store className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-medium">{delivery.shopName}</span>
          <span className="text-gray-400 text-xs">{delivery.shopAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-medium">{delivery.customerName}</span>
          <span className="text-gray-400 text-xs">{delivery.customerAddress}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /><span>{delivery.distance} km</span></div>
        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{delivery.estimatedTime}</span></div>
        <div className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /><span>₹{delivery.orderAmount}</span></div>
      </div>

      {action && (
        <button
          onClick={() => navigate(action.path)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
        >
          {action.label}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
