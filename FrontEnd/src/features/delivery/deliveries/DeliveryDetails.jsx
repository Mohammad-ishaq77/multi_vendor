import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, IndianRupee, Store, User, Phone, Package, MessageSquare } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useToast } from "../components/Toast";

export default function DeliveryDetails() {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const { availableDeliveries, activeDelivery, acceptDelivery, isOnline } = useDeliveryPartner();
  const { addToast } = useToast();

  const delivery = availableDeliveries.find((d) => d.id === deliveryId) || (activeDelivery?.id === deliveryId ? activeDelivery : null);

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-gray-500">Delivery not found</p>
        <button onClick={() => navigate("/delivery/available")} className="mt-4 text-sm text-emerald-600 font-semibold hover:underline">Back to Available</button>
      </div>
    );
  }

  const handleAccept = () => {
    if (!isOnline) { addToast("You must be online to accept deliveries.", "error"); return; }
    if (activeDelivery) { addToast("You already have an active delivery.", "error"); return; }
    const result = acceptDelivery(delivery.id);
    if (result.success) {
      addToast(result.message, "success");
      navigate("/delivery/active");
    } else {
      addToast(result.message, "error");
    }
  };

  const canAccept = isOnline && !activeDelivery && delivery.status === "ready_for_pickup";

  return (
    <div className="w-full space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{delivery.id}</h1>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {delivery.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">₹{delivery.partnerEarning}</p>
            <p className="text-xs text-gray-400">Your earning</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Route Visualization */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="flex-1 border-l-2 border-dashed border-gray-300 ml-1">
                <p className="text-xs text-gray-400 pl-3">{delivery.distance} km · {delivery.estimatedTime}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-rose-500" />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-emerald-600 font-medium">{delivery.shopName}</span>
              <span className="text-rose-600 font-medium">{delivery.customerName}</span>
            </div>
          </div>

          {/* Shop Info */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Shop Information</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700"><Store className="w-4 h-4 text-gray-400" /><span className="font-medium">{delivery.shopName}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /><span>{delivery.shopAddress}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4 text-gray-400" /><span>{delivery.shopPhone}</span></div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Customer Information</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">{delivery.customerName}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /><span>{delivery.customerAddress}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4 text-gray-400" /><span>{delivery.customerPhone}</span></div>
              {delivery.customerInstructions && (
                <div className="flex items-start gap-2 text-sm text-gray-600"><MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /><span className="italic">"{delivery.customerInstructions}"</span></div>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Order Information</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="space-y-2 mb-3">
                {delivery.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.name} × {item.quantity}</span>
                    <span className="text-gray-500">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Order Total</span><span className="font-medium text-gray-700">₹{delivery.orderAmount}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery Fee</span><span className="font-medium text-gray-700">₹{delivery.deliveryFee}</span></div>
                <div className="flex justify-between text-sm"><span className="text-emerald-600 font-semibold">Your Earning</span><span className="font-bold text-emerald-600">₹{delivery.partnerEarning}</span></div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <MapPin className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{delivery.distance} km</p>
              <p className="text-[0.6rem] text-gray-400">Distance</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{delivery.estimatedTime}</p>
              <p className="text-[0.6rem] text-gray-400">Est. Time</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <IndianRupee className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">₹{delivery.deliveryFee}</p>
              <p className="text-[0.6rem] text-gray-400">Fee</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={() => navigate(-1)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all">
            Go Back
          </button>
          {canAccept && (
            <button onClick={handleAccept} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">
              Accept Delivery
            </button>
          )}
          {!isOnline && (
            <button disabled className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed">
              Go Online to Accept
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
