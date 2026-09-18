import { useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Bell,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
} from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";

const ShopSettings = () => {
  const { shop, setShop, shopSettings, setShopSettings } = useShopkeeper();
  const [form, setForm] = useState({
    ...shopSettings,
    openingTime: shop.openingTime || "08:00",
    closingTime: shop.closingTime || "22:00",
    minOrder: shop.minOrder || 100,
    deliveryTime: shop.deliveryTime || "25–35 mins",
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setShopSettings({
      acceptOrders: form.acceptOrders,
      autoAccept: form.autoAccept,
      emailNotifications: form.emailNotifications,
      smsNotifications: form.smsNotifications,
      orderAlerts: form.orderAlerts,
      lowStockAlerts: form.lowStockAlerts,
      reviewAlerts: form.reviewAlerts,
      promoUpdates: form.promoUpdates,
    });
    setShop({
      openingTime: form.openingTime,
      closingTime: form.closingTime,
      minOrder: Number(form.minOrder) || 0,
      deliveryTime: form.deliveryTime,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ enabled, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
        enabled ? "bg-emerald-500" : "bg-gray-300"
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
      />
    </button>
  );

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500";

  return (
    <ShopkeeperShell>
      <div className="w-full space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Shop Settings</h1>
            <p className="mt-0.5 text-sm text-gray-500">Configure orders, hours, delivery, and alerts.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save All
              </>
            )}
          </motion.button>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4" /> Settings saved successfully.
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">Order Settings</h3>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-2.5">
              <div>
                <p className="text-sm font-semibold text-gray-900">Accept Orders</p>
                <p className="text-xs text-gray-500">Allow customers to place orders</p>
              </div>
              <Toggle enabled={form.acceptOrders} onClick={() => toggle("acceptOrders")} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-2.5">
              <div>
                <p className="text-sm font-semibold text-gray-900">Auto-Accept Orders</p>
                <p className="text-xs text-gray-500">Skip manual confirmation</p>
              </div>
              <Toggle enabled={form.autoAccept} onClick={() => toggle("autoAccept")} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Minimum Order (₹)</label>
              <input
                type="number"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                className={inputClass}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="h-full space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">Shop Hours</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Opening Time</label>
                <input
                  type="time"
                  value={form.openingTime}
                  onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Closing Time</label>
                <input
                  type="time"
                  value={form.closingTime}
                  onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-2.5">
              <div>
                <p className="text-sm font-semibold text-gray-900">Shop Open</p>
                <p className="text-xs text-gray-500">{shop.isOpen ? "Visible to customers" : "Hidden from marketplace"}</p>
              </div>
              <Toggle enabled={shop.isOpen} onClick={() => setShop({ isOpen: !shop.isOpen })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Delivery Time</label>
              <input
                value={form.deliveryTime}
                onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                className={inputClass}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="h-full space-y-2.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            </div>
            {[
              { key: "emailNotifications", label: "Email Notifications", desc: "Order updates via email" },
              { key: "smsNotifications", label: "SMS Notifications", desc: "Order updates via SMS" },
              { key: "orderAlerts", label: "Order Alerts", desc: "New order notifications" },
              { key: "lowStockAlerts", label: "Low Stock Alerts", desc: "When products run low" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="truncate text-xs text-gray-500">{item.desc}</p>
                </div>
                <Toggle enabled={form[item.key]} onClick={() => toggle(item.key)} />
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="h-full space-y-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-rose-600">Shop Status</h3>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-2.5">
              <div>
                <p className="text-sm font-semibold text-gray-900">Pause Shop</p>
                <p className="text-xs text-gray-500">Temporarily hide your shop from customers</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShop({ isOpen: !shop.isOpen })}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                  shop.isOpen
                    ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                {shop.isOpen ? "Pause" : "Resume"}
              </motion.button>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Current delivery</p>
                <p className="text-sm font-semibold text-gray-900">
                  {form.deliveryTime} · Min ₹{form.minOrder || 0}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Pausing the shop stops new orders until you resume. Existing orders stay active.
            </p>
          </motion.div>
        </div>
      </div>
    </ShopkeeperShell>
  );
};

export default ShopSettings;
