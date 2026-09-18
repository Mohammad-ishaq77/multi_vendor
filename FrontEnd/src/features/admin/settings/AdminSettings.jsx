import { useState } from "react";
import { motion } from "framer-motion";
import { Save, CheckCircle, Bell, Truck, IndianRupee, Globe } from "lucide-react";
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
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-[#14261f]">Platform Settings</h1><p className="text-sm text-gray-500 mt-1">Configure platform-wide settings and preferences.</p></div>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#155c43] text-white text-sm font-semibold rounded-md hover:bg-[#155c43]/90 transition-colors shadow-lg shadow-[#155c43]/20"><Save className="w-4 h-4" /> Save All</button>
        </div>

        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-700 font-medium">
            <CheckCircle className="w-4 h-4" /> Settings saved successfully.
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {/* General */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-sm space-y-3 h-full">
            <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-[#155c43]" /><h3 className="text-sm font-bold text-gray-900">General</h3></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Platform Name</label><input value={form.platformName || ""} onChange={(e) => setForm({ ...form, platformName: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Support Email</label><input type="email" value={form.supportEmail || ""} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Support Phone</label><input value={form.supportPhone || ""} onChange={(e) => setForm({ ...form, supportPhone: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
            </div>
          </motion.div>

          {/* Delivery */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-sm space-y-3 h-full">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-[#155c43]" /><h3 className="text-sm font-bold text-gray-900">Delivery Rules</h3></div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Max Delivery Distance (km)</label>
              <input type="number" value={form.maxDeliveryDistance || 20} onChange={(e) => setForm({ ...form, maxDeliveryDistance: Number(e.target.value) })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-md p-3 space-y-1.5">
                <p className="text-xs font-semibold text-gray-600">Delivery Fee Rules</p>
                {form.deliveryFeeRules?.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-gray-600 p-2 bg-white rounded-lg">
                    <span>{rule.minKm}–{rule.maxKm} km</span>
                    <span className="font-semibold">Min ₹{rule.minOrder}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-md p-3 space-y-1.5">
                <p className="text-xs font-semibold text-gray-600">Min Order Rules</p>
                {form.minOrderRules?.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-gray-600 p-2 bg-white rounded-lg">
                    <span>{rule.minKm}–{rule.maxKm} km</span>
                    <span className="font-semibold">Min ₹{rule.minOrder}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Revenue */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-sm space-y-3 h-full">
            <div className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-[#155c43]" /><h3 className="text-sm font-bold text-gray-900">Revenue Split</h3></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Partner %</label><input type="number" value={form.deliveryPartnerPercentage || 80} onChange={(e) => setForm({ ...form, deliveryPartnerPercentage: Number(e.target.value) })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">NearMart %</label><input type="number" value={form.platformPercentage || 20} onChange={(e) => setForm({ ...form, platformPercentage: Number(e.target.value) })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
            </div>
            <div className="bg-gray-50 rounded-md p-3 flex items-center justify-between text-xs text-gray-500">
              <span>Total</span>
              <span className="font-bold text-gray-900">{(form.deliveryPartnerPercentage || 80) + (form.platformPercentage || 20)}%</span>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-sm space-y-2.5 h-full">
            <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-[#155c43]" /><h3 className="text-sm font-bold text-gray-900">Notifications</h3></div>
            {[
              { key: "emailNotifications", label: "Email Notifications", desc: "Receive email alerts for important events" },
              { key: "applicationNotifications", label: "Application Notifications", desc: "In-app notification alerts" },
              { key: "orderNotifications", label: "Order Notifications", desc: "Alerts for new and updated orders" },
              { key: "paymentNotifications", label: "Payment Notifications", desc: "Alerts for payments and transactions" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 rounded-md">
                <div className="min-w-0"><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-500 truncate">{item.desc}</p></div>
                <button type="button" onClick={() => toggle(item.key)} className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${form[item.key] ? "bg-[#155c43]" : "bg-gray-300"}`}>
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all" style={{ left: form[item.key] ? "22px" : "2px" }} />
                </button>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
