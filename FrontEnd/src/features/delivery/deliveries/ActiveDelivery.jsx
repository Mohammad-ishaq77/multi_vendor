import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import ActiveDeliveryCard from "../components/ActiveDeliveryCard";

export default function ActiveDelivery() {
  const navigate = useNavigate();
  const { activeDelivery, cancelDelivery } = useDeliveryPartner();

  if (!activeDelivery) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Active Delivery</h1>
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-500">No active delivery</p>
          <p className="text-xs text-gray-400 mt-1">Accept a delivery to get started</p>
          <button onClick={() => navigate("/delivery/available")} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all">
            View Available Deliveries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Active Delivery</h1>
        <button
          onClick={() => { cancelDelivery(); navigate("/delivery/available"); }}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
        >
          Cancel Delivery
        </button>
      </div>
      <ActiveDeliveryCard delivery={activeDelivery} />
    </div>
  );
}
