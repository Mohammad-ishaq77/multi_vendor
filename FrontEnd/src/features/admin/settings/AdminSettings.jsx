import { useState } from "react";
import { motion } from "framer-motion";
import { Save, CheckCircle, Settings, Bell, Truck, IndianRupee, Globe } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

export default function AdminSettings() {
  const { settings, updateSettings } = useAdmin();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggle = (key) => setForm({ ...form, [key]: !form[key] });

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-[#14261f]">Platform Settings</h1><p className="text-sm text-gray-500 mt-1">Configure platform-wide settings and preferences.</p></div>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#155c43] text-white text-sm font-semibold rounded-xl hover:bg-[#155c43]/90 transition-colors shadow-lg shadow-[#155c43]/20"><Save className="w-4 h-4" /> Save All</button>
        </div>

        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
            <CheckCircle className="w-4 h-4" /> Settings saved successfully.
          </motion.div>
        )}

        {/* General */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2"><Globe className="w-5 h-5 text-[#155c43]" /><h3 className="text-sm font-bold text-gray-900">General</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Platform Name</label><input value={form.platformName || ""} onChange={(e) => setForm({ ...form, platformName: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Support Email</label><input type="email" value={form.supportEmail || ""} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Support Phone</label><input value={form.supportPhone || ""} onChange={(e) => setForm({ ...form, supportPhone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
          </div>
        </motion.div>

        {/* Delivery */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2"><Truck className="w-5 h-5 text-[#155c43]" /><h3 className="text-sm font-bold text-gray-900">Delivery Rules</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Max Delivery Distance (km)</label><input type="number" value={form.maxDeliveryDistance || 20} onChange={(e) => setForm({ ...form, maxDeliveryDistance: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-600 mb-2">Delivery Fee Rules</p>
            {form.deliveryFeeRules?.map((rule, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-gray-600 p-2 bg-white rounded-lg">
                <span>{rule.minKm}–{rule.maxKm} km</span>
                <span className="font-semibold">Min ₹{rule.minOrder}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-600 mb-2">Min Order Rules</p>
            {form.minOrderRules?.map((rule, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-gray-600 p-2 bg-white rounded-lg">
                <span>{rule.minKm}–{rule.maxKm} km</span>
                <span className="font-semibold">Min ₹{rule.minOrder}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Revenue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2"><IndianRupee className="w-5 h-5 text-[#155c43]" /><h3 className="text-sm font-bold text-gray-900">Revenue Split</h3></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Partner %</label><input type="number" value={form.deliveryPartnerPercentage || 80} onChange={(e) => setForm({ ...form, deliveryPartnerPercentage: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">NearMart %</label><input type="number" value={form.platformPercentage || 20} onChange={(e) => setForm({ ...form, platformPercentage: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between text-xs text-gray-500">
            <span>Total</span>
            <span className="font-bold text-gray-900">{(form.deliveryPartnerPercentage || 80) + (form.platformPercentage || 20)}%</span>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2"><Bell className="w-5 h-5 text-[#155c43]" /><h3 className="text-sm font-bold text-gray-900">Notifications</h3></div>
          {[
            { key: "emailNotifications", label: "Email Notifications", desc: "Receive email alerts for important events" },
            { key: "applicationNotifications", label: "Application Notifications", desc: "In-app notification alerts" },
            { key: "orderNotifications", label: "Order Notifications", desc: "Alerts for new and updated orders" },
            { key: "paymentNotifications", label: "Payment Notifications", desc: "Alerts for payments and transactions" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
              <button onClick={() => toggle(item.key)} className={`w-11 h-6 rounded-full transition-colors relative ${form[item.key] ? "bg-[#155c43]" : "bg-gray-300"}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${form[item.key] ? "left-5.5" : "left-0.5"}`} style={{ left: form[item.key] ? "22px" : "2px" }} />
              </button>
            </div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
}
