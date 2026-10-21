import { motion } from "framer-motion";
import { MapPin, Clock, IndianRupee, Store, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ActiveDeliveryCard({ delivery }) {
  const navigate = useNavigate();
  if (!delivery) return null;

  const assignmentStatus = delivery.assignment?.status;
  const isPickedUp = ["picked_up", "out_for_delivery"].includes(assignmentStatus);
  const progressSteps = ["preparing", "ready_for_pickup", "picked_up", "out_for_delivery", "delivered"];
  const progressStatus = isPickedUp
    ? assignmentStatus
    : delivery.status === "accepted"
      ? "preparing"
      : delivery.status;
  const currentStepIndex = progressSteps.indexOf(progressStatus);
  const progress = currentStepIndex >= 0 ? ((currentStepIndex + 1) / progressSteps.length) * 100 : 0;
  const actionLabel = isPickedUp
    ? "Complete delivery with OTP"
    : delivery.status === "ready_for_pickup"
      ? "Mark as picked up"
      : delivery.status === "preparing"
        ? "Mark ready for pickup"
        : "Continue delivery";
  const statusLabel = progressStatus.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-md border border-gray-100 p-3.5 shadow-sm hover:shadow-md transition-all sm:rounded-lg sm:p-5">
      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
        <div>
          <p className="text-xs font-bold text-gray-900 sm:text-sm">{delivery.id}</p>
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Active Delivery
          </span>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-emerald-600 sm:text-lg">₹{delivery.partnerEarning}</p>
          <p className="text-[0.65rem] text-gray-400">Your earning (80%)</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full"
          />
        </div>
        <p className="text-[0.65rem] text-gray-400 mt-1">{statusLabel}</p>
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

      <button
        type="button"
        onClick={() => navigate(`/delivery/details/${delivery.id}`)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
      >
        {actionLabel}
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
