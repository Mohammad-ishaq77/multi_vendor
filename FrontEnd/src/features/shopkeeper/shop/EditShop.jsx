import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Store,
  Phone,
  MapPin,
  Clock,
  Mail,
  FileText,
  CheckCircle2,
  Camera,
  X,
} from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50";

const getTimePeriod = (time) => Number(time?.split(":")[0]) >= 12 ? "PM" : "AM";

const updateTimePeriod = (time, period) => {
  const [hours, minutes] = time.split(":");
  let hour = Number(hours) % 12;
  if (period === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${minutes}`;
};

const EditShop = () => {
  const navigate = useNavigate();
  const { shop, setShop } = useShopkeeper();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ ...shop });
  const [saved, setSaved] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => update("shopImage", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setShop(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <ShopkeeperShell>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/shopkeeper/shop")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Shop
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1">Edit Shop</h1>
        <p className="text-sm text-gray-500 mb-6">Update your shop information and settings.</p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Shop Name</label>
                <div className="relative"><Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} /></div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <div className="relative"><FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" /><textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className={inputClass + " resize-none"} /></div>
              </div>

              {/* Shop Image */}
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Shop Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {form.shopImage ? (
                  <div className="relative inline-block">
                    <img
                      src={form.shopImage}
                      alt="Shop preview"
                      className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => update("shopImage", null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors"
                  >
                    <Camera className="w-8 h-8" />
                    <span className="text-sm font-medium">Upload shop image</span>
                    <span className="text-xs">Customers will see this on your shop page</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                  <div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} /></div>
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Address & Location */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Address & Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Address</label>
                <div className="relative"><MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" /><textarea value={form.address} onChange={(e) => update("address", e.target.value)} rows={2} className={inputClass + " resize-none"} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
                  <input value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                  <input value={form.state} onChange={(e) => update("state", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pincode</label>
                  <input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Business Hours</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Opening Time</label>
                <div className="flex gap-2">
                  <div className="relative flex-1"><Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="time" value={form.openingTime} onChange={(e) => update("openingTime", e.target.value)} className={inputClass} /></div>
                  <select value={getTimePeriod(form.openingTime)} onChange={(e) => update("openingTime", updateTimePeriod(form.openingTime, e.target.value))} className="bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50">
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Closing Time</label>
                <div className="flex gap-2">
                  <div className="relative flex-1"><Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="time" value={form.closingTime} onChange={(e) => update("closingTime", e.target.value)} className={inputClass} /></div>
                  <select value={getTimePeriod(form.closingTime)} onChange={(e) => update("closingTime", updateTimePeriod(form.closingTime, e.target.value))} className="bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50">
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved Successfully</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </motion.button>
            {saved && <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-emerald-600 font-medium">Changes saved!</motion.span>}
          </div>
        </form>
      </div>
    </ShopkeeperShell>
  );
};

export default EditShop;
