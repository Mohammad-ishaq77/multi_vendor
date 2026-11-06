import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from "lucide-react";
import LocationPicker from "../../../components/common/LocationPicker";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useToast } from "../components/Toast";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useDeliveryPartner();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  });
  const [location, setLocation] = useState(
    profile?.address?.lat != null && profile?.address?.lng != null
      ? { lat: Number(profile.address.lat), lng: Number(profile.address.lng) }
      : null
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!location) {
      addToast("Please set your delivery location on the map.", "error");
      return;
    }
    setSaving(true);
    const result = await updateProfile({
      ...form,
      addressData: {
        ...(profile?.address || {}),
        lat: location.lat,
        lng: location.lng,
      },
      lat: location.lat,
      lng: location.lng,
    });
    setSaving(false);
    if (result?.ok === false) {
      addToast(result.error || "We could not save your profile.", "error");
      return;
    }
    addToast("Profile updated successfully.", "success");
    navigate("/delivery/profile");
  };

  const inputClass = (field) => `w-full px-4 py-2.5 rounded-md border text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${errors[field] ? "border-rose-300 bg-rose-50" : "border-gray-200"}`;

  return (
    <div className="w-full space-y-4">
      <button onClick={() => navigate("/delivery/profile")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Edit Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Update your personal information</p>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputClass("name")} pl-10`} />
            </div>
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputClass("email")} pl-10`} />
            </div>
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputClass("phone")} pl-10`} />
            </div>
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Delivery location
            </div>
            <LocationPicker
              value={location}
              onChange={setLocation}
              label="Current delivery location"
              hint="This updates the position used when matching nearby delivery jobs."
              mapHeight="h-60"
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={() => navigate("/delivery/profile")} className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
            {!saving && <Save className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
