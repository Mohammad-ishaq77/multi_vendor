import { motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function AvailabilityToggle() {
  const { isOnline, toggleAvailability } = useDeliveryPartner();

  return (
    <motion.div whileHover={{ y: -1 }} className={`rounded-2xl border p-5 transition-all ${
      isOnline ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${
            isOnline ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-200" : "bg-gray-200 text-gray-500"
          }`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {isOnline ? "You are available for deliveries" : "You are currently offline"}
            </p>
            <p className="text-xs text-gray-500">
              {isOnline ? "Receiving new delivery requests" : "Go online to receive delivery requests"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleAvailability}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
            isOnline ? "bg-emerald-500" : "bg-gray-300"
          }`}
          aria-label={isOnline ? "Go offline" : "Go online"}
        >
          <motion.div
            animate={{ x: isOnline ? 28 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-[2px] w-6 h-6 bg-white rounded-full shadow-md"
          />
        </button>
      </div>
    </motion.div>
  );
}
