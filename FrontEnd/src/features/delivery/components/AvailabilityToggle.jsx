import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Truck, Wifi, WifiOff } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function AvailabilityToggle() {
  const { isOnline, activeDelivery, toggleAvailability } = useDeliveryPartner();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  const handleToggle = async () => {
    setUpdating(true);
    try {
      await toggleAvailability();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div whileHover={{ y: -1 }} className={`rounded-lg border p-5 transition-all ${
      isOnline ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-md flex items-center justify-center shadow-lg ${
            isOnline ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-200" : "bg-gray-200 text-gray-500"
          }`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {isOnline ? "You are available for deliveries" : "You are currently offline"}
            </p>
            <p className="text-xs text-gray-500">
              {activeDelivery
                ? "Complete your active delivery before changing availability"
                : isOnline
                  ? "Receiving new delivery requests"
                  : "Go online to receive delivery requests"}
            </p>
          </div>
        </div>
        {activeDelivery ? (
          <button
            type="button"
            onClick={() => navigate("/delivery/active")}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Truck className="h-4 w-4" />
            Complete delivery
          </button>
        ) : (
          <button
            type="button"
            onClick={handleToggle}
            disabled={updating}
            className={`relative flex h-7 w-14 items-center justify-center rounded-full transition-colors duration-300 disabled:cursor-wait ${
              isOnline ? "bg-emerald-500" : "bg-gray-300"
            }`}
            aria-label={isOnline ? "Go offline" : "Go online"}
          >
            {updating ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <motion.div
                animate={{ x: isOnline ? 14 : -14 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-[2px] h-6 w-6 rounded-full bg-white shadow-md"
              />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
