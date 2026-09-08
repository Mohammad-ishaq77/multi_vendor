import { motion } from "framer-motion";
import { MapPin, Clock, IndianRupee, ArrowRight, Store, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DeliveryCard({ delivery, showAccept = false, onAccept }) {
  const navigate = useNavigate();

  const statusColors = {
    ready_for_pickup: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-amber-50 text-amber-700 border-amber-200",
    picked_up: "bg-violet-50 text-violet-700 border-violet-200",
    out_for_delivery: "bg-orange-50 text-orange-700 border-orange-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">{delivery.id}</p>
          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border ${statusColors[delivery.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
            {delivery.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-600">₹{delivery.partnerEarning}</p>
          <p className="text-[0.65rem] text-gray-400">Your earning</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Store className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-medium">{delivery.shopName}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400 text-xs">{delivery.shopAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-medium">{delivery.customerName}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400 text-xs">{delivery.customerAddress}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{delivery.distance} km</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{delivery.estimatedTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>₹{delivery.orderAmount}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/deliverypartner/details/${delivery.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        {showAccept && (
          <button
            onClick={() => onAccept?.(delivery.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
          >
            Accept Delivery
          </button>
        )}
      </div>
    </motion.div>
  );
}
