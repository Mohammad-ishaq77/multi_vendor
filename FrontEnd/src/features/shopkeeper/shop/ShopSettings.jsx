import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Bell,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";

const ShopSettings = () => {
  const navigate = useNavigate();
  const { shop, setShop } = useShopkeeper();
  const [settings, setSettings] = useState({
    acceptOrders: true,
    autoAccept: false,
    emailNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    lowStockAlerts: true,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ enabled, onClick }) => (
    <button type="button" onClick={onClick} className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${enabled ? "bg-emerald-500" : "bg-gray-300"}`}>
      <motion.div animate={{ x: enabled ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
    </button>
  );

  return (
    <ShopkeeperShell>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1">Shop Settings</h1>
        <p className="text-sm text-gray-500 mb-6">Configure your shop preferences and notifications.</p>

        <div className="space-y-6">
          {/* Order Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Order Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Accept Orders</p>
                  <p className="text-xs text-gray-500">Allow customers to place orders from your shop</p>
                </div>
                <Toggle enabled={settings.acceptOrders} onClick={() => toggle("acceptOrders")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Auto-Accept Orders</p>
                  <p className="text-xs text-gray-500">Automatically accept new orders without manual confirmation</p>
                </div>
                <Toggle enabled={settings.autoAccept} onClick={() => toggle("autoAccept")} />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" /> Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive order updates via email</p>
                </div>
                <Toggle enabled={settings.emailNotifications} onClick={() => toggle("emailNotifications")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">SMS Notifications</p>
                  <p className="text-xs text-gray-500">Receive order updates via SMS</p>
                </div>
                <Toggle enabled={settings.smsNotifications} onClick={() => toggle("smsNotifications")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order Alerts</p>
                  <p className="text-xs text-gray-500">Get notified for new orders</p>
                </div>
                <Toggle enabled={settings.orderAlerts} onClick={() => toggle("orderAlerts")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Low Stock Alerts</p>
                  <p className="text-xs text-gray-500">Get notified when products are running low</p>
                </div>
                <Toggle enabled={settings.lowStockAlerts} onClick={() => toggle("lowStockAlerts")} />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-rose-200 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Pause Shop</p>
                <p className="text-xs text-gray-500">Temporarily hide your shop from customers</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShop({ isOpen: !shop.isOpen })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  shop.isOpen ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                {shop.isOpen ? "Pause Shop" : "Resume Shop"}
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Settings</>}
            </motion.button>
          </div>
        </div>
      </div>
    </ShopkeeperShell>
  );
};

export default ShopSettings;
