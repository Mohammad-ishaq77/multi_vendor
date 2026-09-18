import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Phone,
  MapPin,
  Clock,
  Mail,
  FileText,
  ChevronRight,
  ChevronLeft,
  Camera,
  X,
} from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-md py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50";

const getTimePeriod = (time) => Number(time?.split(":")[0]) >= 12 ? "PM" : "AM";

const updateTimePeriod = (time, period) => {
  const [hours, minutes] = time.split(":");
  let hour = Number(hours) % 12;
  if (period === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${minutes}`;
};

const CreateShop = () => {
  const navigate = useNavigate();
  const { shop, setShop, setOnboardingStep } = useShopkeeper();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: shop.name !== "Fresh Basket" ? shop.name : "",
    description: shop.description !== "Your one-stop shop for fresh groceries, fruits, vegetables, and daily essentials. We source directly from local farmers to ensure the freshest products." ? shop.description : "",
    phone: shop.phone !== "+91 98765 43210" ? shop.phone : "",
    email: shop.email !== "freshbasket@example.com" ? shop.email : "",
    address: shop.address !== "123 Residency Road, Near Polo View" ? shop.address : "",
    city: shop.city !== "Srinagar" ? shop.city : "",
    state: shop.state !== "Jammu & Kashmir" ? shop.state : "",
    pincode: shop.pincode !== "190001" ? shop.pincode : "",
    openingTime: shop.openingTime,
    closingTime: shop.closingTime,
    minOrder: shop.minOrder,
    shopImage: shop.shopImage || null,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, shopImage: "Image must be under 5MB" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      update("shopImage", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Shop name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.openingTime) errs.openingTime = "Required";
    if (!form.closingTime) errs.closingTime = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setShop({ ...form, isApproved: false });
      setOnboardingStep("documents");
      navigate("/shopkeeper/onboarding/documents");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/25 mx-auto mb-3">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Your Shop</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in your shop details to get started.</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6 shadow-sm space-y-4">
          {/* Shop Name */}
          <div>
            <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Shop Name *</label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Fresh Basket" className={inputClass} />
            </div>
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Tell customers about your shop..."
                rows={3}
                className={inputClass + " resize-none"}
              />
            </div>
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
                  className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
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
                className="w-full border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors"
              >
                <Camera className="w-8 h-8" />
                <span className="text-sm font-medium">Upload shop image</span>
                <span className="text-xs">Customers will see this on your shop page</span>
              </button>
            )}
            {errors.shopImage && <p className="text-xs text-rose-500 mt-1">{errors.shopImage}</p>}
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
              </div>
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" placeholder="shop@example.com" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Address *</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <textarea
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Full shop address"
                rows={2}
                className={inputClass + " resize-none"}
              />
            </div>
            {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
          </div>

          {/* City, State, Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">City *</label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="City" className="w-full bg-gray-50 border border-gray-200 rounded-md py-3 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all" />
              {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
              <input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="State" className="w-full bg-gray-50 border border-gray-200 rounded-md py-3 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all" />
            </div>
            <div>
              <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pincode</label>
              <input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} placeholder="190001" className="w-full bg-gray-50 border border-gray-200 rounded-md py-3 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all" />
            </div>
          </div>

          {/* Hours */}
          <div>
            <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Business Hours *</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <div className="flex gap-2">
                  <input type="time" value={form.openingTime} onChange={(e) => update("openingTime", e.target.value)} className={inputClass + " flex-1"} />
                  <select value={getTimePeriod(form.openingTime)} onChange={(e) => update("openingTime", updateTimePeriod(form.openingTime, e.target.value))} className="bg-gray-50 border border-gray-200 rounded-md px-3 text-sm text-gray-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50">
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <div className="flex gap-2">
                  <input type="time" value={form.closingTime} onChange={(e) => update("closingTime", e.target.value)} className={inputClass + " flex-1"} />
                  <select value={getTimePeriod(form.closingTime)} onChange={(e) => update("closingTime", updateTimePeriod(form.closingTime, e.target.value))} className="bg-gray-50 border border-gray-200 rounded-md px-3 text-sm text-gray-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50">
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-5">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { setOnboardingStep("type_selection"); navigate("/shopkeeper/onboarding"); }}
            className="flex items-center gap-2 px-5 py-3 rounded-md text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleProceed}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-md font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateShop;
