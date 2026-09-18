import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, MapPin, Clock, Package, ArrowRight } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function DeliveryCompleted() {
  const navigate = useNavigate();
  const { activeDelivery, deliveryHistory, completeDelivery } = useDeliveryPartner();

  useEffect(() => {
    if (activeDelivery?.status === "otp_verified") completeDelivery();
  }, [activeDelivery, completeDelivery]);

  const delivery = deliveryHistory[0];

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Completed</h1>
          <p className="text-sm text-gray-500 mt-1">Great job! The delivery has been completed successfully.</p>
        </div>

        <div className="px-8 pb-8 space-y-4">
          <div className="bg-emerald-50 rounded-md p-4 text-center">
            <p className="text-xs text-emerald-600 font-medium">Your Earnings</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">₹{delivery?.partnerEarning ?? "—"}</p>
            <p className="text-xs text-emerald-500 mt-1">Added to your account</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <MapPin className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{delivery?.distance ?? "—"} km</p>
              <p className="text-[0.6rem] text-gray-400">Distance</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{delivery?.estimatedTime ?? "—"}</p>
              <p className="text-[0.6rem] text-gray-400">Duration</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={() => navigate("/delivery/history")} className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all">
              <Package className="w-4 h-4" /> View History
            </button>
            <button onClick={() => navigate("/delivery/dashboard")} className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">
              Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
