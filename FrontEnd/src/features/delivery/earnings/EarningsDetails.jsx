import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, IndianRupee } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function EarningsDetails() {
  const { earningId } = useParams();
  const navigate = useNavigate();
  const { earnings } = useDeliveryPartner();

  const txn = earnings.recentTransactions.find((t) => t.id === earningId);

  if (!txn) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <IndianRupee className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-gray-500">Transaction not found</p>
        <button onClick={() => navigate("/delivery/earnings")} className="mt-4 text-sm text-emerald-600 font-semibold hover:underline">Back to Earnings</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <button onClick={() => navigate("/delivery/earnings")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Earnings
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 text-center border-b border-gray-100">
          <p className="text-xs text-gray-400">You earned</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">₹{txn.partnerEarning}</p>
          <p className="text-xs text-gray-400 mt-1">{txn.orderId}</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Order</span><span className="font-medium text-gray-700">{txn.orderId}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium text-gray-700">{txn.date}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Distance</span><span className="font-medium text-gray-700">{txn.distance} km</span></div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery Fee</span><span className="font-medium text-gray-700">₹{txn.deliveryFee}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Partner Share</span><span className="font-medium text-gray-700">{txn.partnerPercentage}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-emerald-600 font-semibold">Partner Earning</span><span className="font-bold text-emerald-600">₹{txn.partnerEarning}</span></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
