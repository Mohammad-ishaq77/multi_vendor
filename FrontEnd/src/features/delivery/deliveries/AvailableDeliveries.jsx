import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, WifiOff } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import DeliveryCard from "../components/DeliveryCard";
import AvailabilityToggle from "../components/AvailabilityToggle";
import { useToast } from "../components/Toast";

export default function AvailableDeliveries() {
  const { isOnline, availableDeliveries, activeDelivery, acceptDelivery } = useDeliveryPartner();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");

  const filtered = availableDeliveries.filter(
    (d) =>
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.shopName.toLowerCase().includes(search.toLowerCase()) ||
      d.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAccept = (deliveryId) => {
    if (!isOnline) {
      addToast("You must be online to accept deliveries.", "error");
      return;
    }
    if (activeDelivery) {
      addToast("You already have an active delivery. Complete it before accepting another.", "error");
      return;
    }
    setTimeout(() => {
      const result = acceptDelivery(deliveryId);
      if (result.success) {
        addToast(result.message, "success");
      } else {
        addToast(result.message, "error");
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Deliveries</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} deliveries available</p>
        </div>
      </div>

      <AvailabilityToggle />

      {!isOnline && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
          <WifiOff className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-500">You are offline</p>
          <p className="text-xs text-gray-400 mt-1">Go online to receive delivery requests</p>
        </motion.div>
      )}

      {isOnline && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, shop, or customer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">No deliveries available right now</p>
              <p className="text-xs text-gray-400 mt-1">Stay online to receive new requests</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  showAccept={isOnline && !activeDelivery}
                  onAccept={handleAccept}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
