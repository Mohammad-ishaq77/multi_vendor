import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, IndianRupee, Truck, Star, ArrowRight, MapPin } from "lucide-react";
import { useDeliveryPartner } from "./context/DeliveryPartnerContext";
import StatCard from "./components/StatCard";
import AvailabilityToggle from "./components/AvailabilityToggle";
import ActiveDeliveryCard from "./components/ActiveDeliveryCard";
import DeliveryCard from "./components/DeliveryCard";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

export default function DeliveryPartnerDashboard() {
  const navigate = useNavigate();
  const { profile, isOnline, activeDelivery, availableDeliveries, earnings, deliveryHistory } = useDeliveryPartner();

  const recentDeliveries = deliveryHistory.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {profile.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isOnline ? "Ready to deliver? You're online." : "Go online to start receiving deliveries."}
        </p>
      </motion.div>

      {/* Availability */}
      <AvailabilityToggle />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Truck} label="Today's Deliveries" value={profile.todayDeliveries} accent="emerald" />
        <StatCard icon={IndianRupee} label="Today's Earnings" value={`₹${profile.todayEarnings}`} accent="teal" />
        <StatCard icon={Package} label="Completed" value={profile.completedDeliveries} accent="blue" />
        <StatCard icon={Star} label="Rating" value={`${profile.rating} ★`} accent="amber" />
      </div>

      {/* Active Delivery */}
      {activeDelivery && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Active Delivery</h2>
            <button onClick={() => navigate("/deliverypartner/active")} className="text-sm text-emerald-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ActiveDeliveryCard delivery={activeDelivery} />
        </div>
      )}

      {/* Available Deliveries */}
      {isOnline && availableDeliveries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Available Deliveries</h2>
            <button onClick={() => navigate("/deliverypartner/available")} className="text-sm text-emerald-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDeliveries.slice(0, 2).map((d) => (
              <DeliveryCard key={d.id} delivery={d} showAccept={!activeDelivery} />
            ))}
          </div>
        </div>
      )}

      {/* Earnings Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Earnings Summary</h2>
          <button onClick={() => navigate("/deliverypartner/earnings")} className="text-sm text-emerald-600 font-semibold hover:underline flex items-center gap-1">
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-gray-900">₹{earnings.today}</p>
            <p className="text-xs text-gray-400 mt-1">Today</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-gray-900">₹{earnings.thisWeek}</p>
            <p className="text-xs text-gray-400 mt-1">This Week</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-gray-900">₹{earnings.thisMonth}</p>
            <p className="text-xs text-gray-400 mt-1">This Month</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-emerald-600">₹{earnings.total}</p>
            <p className="text-xs text-gray-400 mt-1">Total</p>
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      {recentDeliveries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Recent Deliveries</h2>
            <button onClick={() => navigate("/deliverypartner/history")} className="text-sm text-emerald-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {recentDeliveries.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{d.id}</p>
                    <p className="text-xs text-gray-400">{d.shopName} → {d.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">₹{d.partnerEarning}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end"><MapPin className="w-3 h-3" />{d.distance} km</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
