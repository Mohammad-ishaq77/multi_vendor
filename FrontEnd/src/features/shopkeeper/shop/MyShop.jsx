import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Store, Edit3, Star, Clock, MapPin, Phone, Mail, Truck } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const MyShop = () => {
  const navigate = useNavigate();
  const { shop } = useShopkeeper();

  const lat = shop.latitude || 34.0837;
  const lng = shop.longitude || 74.7973;

  return (
    <ShopkeeperShell>
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">My Shop</h1>
            <p className="text-xs text-gray-500 mt-0.5">View and manage your shop information</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/shopkeeper/shop/edit")}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" /> Edit Shop
          </motion.button>
        </div>

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/20 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              {shop.shopImage ? (
                <img src={shop.shopImage} alt={shop.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{shop.name}</h2>
              <p className="text-emerald-100 text-sm">{shop.type} &middot; {shop.city}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${shop.isOpen ? "bg-emerald-300 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-xs font-medium text-emerald-100">{shop.isOpen ? "Open Now" : "Closed"}</span>
                <span className="text-emerald-300">|</span>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span className="text-xs font-medium">{shop.rating}</span>
                  <span className="text-emerald-200">({shop.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{shop.phone}</span></div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{shop.email}</span></div>
              <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><span className="text-sm text-gray-700">{shop.address}, {shop.city}, {shop.state} - {shop.pincode}</span></div>
            </div>
          </motion.div>

          {/* Business Hours */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Business Hours</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{shop.openingTime} – {shop.closingTime}</span></div>
              <div className="flex items-center gap-3"><Truck className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{shop.deliveryTime} delivery</span></div>
              <div className="flex items-center gap-3"><span className="text-sm text-gray-700">Min order: ₹{shop.minOrder}</span></div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">About Shop</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{shop.description}</p>
          </motion.div>

          {/* Shop Location Map */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm sm:col-span-2">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Shop Location
            </h3>
            <div className="rounded-md overflow-hidden border border-gray-200" style={{ height: "300px" }}>
              <MapContainer
                center={[lat, lng]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                  <Popup>
                    <strong>{shop.name}</strong><br />
                    {shop.address}, {shop.city}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="text-xs text-gray-400 mt-2">Lat: {lat}, Lng: {lng} — <button onClick={() => navigate("/shopkeeper/shop/edit")} className="text-emerald-600 font-medium hover:underline">Update location</button></p>
          </motion.div>
        </div>
      </div>
    </ShopkeeperShell>
  );
};

export default MyShop;
