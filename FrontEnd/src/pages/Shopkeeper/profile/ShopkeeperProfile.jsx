import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Camera,
  CheckCircle2,
  Shield,
  Lock,
  LogOut,
  Store,
  Bell,
} from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50";

const ShopkeeperProfile = () => {
  const navigate = useNavigate();
  const { profile, setProfile, shop } = useShopkeeper();
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(form);
    window.dispatchEvent(new Event("nearmart-profile-change"));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const menuItems = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <ShopkeeperShell>
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-4">
              <div className="h-28 bg-gradient-to-r from-emerald-600 to-teal-600 relative">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="relative w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden">
                    {form.image ? (
                      <img src={form.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                        <User className="w-12 h-12 text-emerald-600" />
                      </div>
                    )}
                    <label htmlFor="sk-profile-image" className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6" />
                    </label>
                  </div>
                  <input id="sk-profile-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
              </div>
              <div className="pt-14 px-5 pb-5 text-center">
                <h2 className="font-bold text-gray-900 text-base">{form.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{form.email}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">{shop.name}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm hidden lg:block">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {item.label}
                  </button>
                );
              })}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => { localStorage.removeItem("nearmart_session"); navigate("/login", { replace: true }); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1">Profile Settings</h1>
              <p className="text-sm text-gray-500 mb-6">Manage your personal details and preferences.</p>

              {activeSection === "personal" && (
                <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                      <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className={inputClass} /></div>
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                      <div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <motion.button whileTap={{ scale: 0.98 }} type="submit" className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                      {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save Profile"}
                    </motion.button>
                    {saved && <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-emerald-600 font-medium">Changes saved!</motion.span>}
                  </div>
                </form>
              )}

              {activeSection === "security" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2"><Lock className="w-4 h-4 text-gray-400" /> Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
                      <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="Enter current password" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                      <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} placeholder="Enter new password" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                      <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Confirm new password" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all" />
                    </div>
                    <motion.button whileTap={{ scale: 0.98 }} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                      Update Password
                    </motion.button>
                  </div>
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2"><Bell className="w-4 h-4 text-gray-400" /> Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { label: "New Order Alerts", desc: "Get notified when a new order is placed" },
                      { label: "Order Status Updates", desc: "Notifications for order status changes" },
                      { label: "Review Notifications", desc: "Get notified when customers leave reviews" },
                      { label: "Promotional Updates", desc: "Marketing and promotional notifications" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <button className="relative w-12 h-6 rounded-full bg-emerald-500 transition-colors">
                          <motion.div animate={{ x: 24 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Menu */}
              <div className="lg:hidden mt-4 bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${activeSection === item.id ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}>
                      <Icon className="w-4 h-4 text-gray-400" /> {item.label}
                    </button>
                  );
                })}
                <button onClick={() => { localStorage.removeItem("nearmart_session"); navigate("/login", { replace: true }); }} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ShopkeeperShell>
  );
};

export default ShopkeeperProfile;
