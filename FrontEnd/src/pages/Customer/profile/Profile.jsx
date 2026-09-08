import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Bell,
  LogOut,
  Package,
} from "lucide-react";
import CustomerShell from "../components/CustomerShell";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() =>
    JSON.parse(
      localStorage.getItem("nearmart_profile") ||
        '{"name":"NearMart Customer","email":"customer@example.com","phone":"+91 98765 43210","address":"Srinagar, Jammu & Kashmir"}'
    )
  );
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfile((c) => ({ ...c, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const save = (event) => {
    event.preventDefault();
    localStorage.setItem("nearmart_profile", JSON.stringify(profile));
    localStorage.setItem("nearmart_user", JSON.stringify(profile));
    window.dispatchEvent(new Event("nearmart-profile-change"));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const menuItems = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin, action: () => navigate("/customer/addresses") },
    { id: "orders", label: "My Orders", icon: Package, action: () => navigate("/customer/orders") },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50";

  return (
    <CustomerShell>
      <div className="min-h-screen bg-[#fafcfb]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid lg:grid-cols-[260px_1fr] gap-6">
            {/* Sidebar */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-4">
                {/* Banner */}
                <div className="h-28 bg-gradient-to-r from-emerald-600 to-teal-600 relative">
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <div className="relative w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden">
                      {profile.image ? (
                        <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                          <User className="w-12 h-12 text-emerald-600" />
                        </div>
                      )}
                      <label
                        htmlFor="profile-image"
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Camera className="w-6 h-6" />
                      </label>
                    </div>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="pt-14 px-5 pb-5 text-center">
                  <h2 className="font-bold text-gray-900 text-base">{profile.name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{profile.email}</p>
                </div>
              </div>

              {/* Nav Menu */}
              <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm hidden lg:block">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        item.action?.();
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      localStorage.removeItem("nearmart_session");
                      navigate("/login", { replace: true });
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1">
                  Profile Settings
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                  Manage your personal details and preferences.
                </p>

                {/* Form */}
                <form onSubmit={save} className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">Personal Information</h3>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          placeholder="Full name"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          type="email"
                          placeholder="Email"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={profile.phone || ""}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          type="tel"
                          placeholder="+91 98765 43210"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Delivery Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                        <textarea
                          value={profile.address || ""}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          placeholder="Enter your full address"
                          rows={3}
                          className={inputClass + " resize-none"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save */}
                  <div className="mt-6 flex items-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                    >
                      {saved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Saved Successfully
                        </>
                      ) : (
                        "Save Profile"
                      )}
                    </motion.button>
                    {saved && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-emerald-600 font-medium"
                      >
                        Changes saved!
                      </motion.span>
                    )}
                  </div>
                </form>

                {/* Quick Links (Mobile) */}
                <div className="lg:hidden mt-4 bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
                  {menuItems.filter((m) => m.action).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        {item.label}
                        <span className="ml-auto text-gray-300">→</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </CustomerShell>
  );
};

export default Profile;