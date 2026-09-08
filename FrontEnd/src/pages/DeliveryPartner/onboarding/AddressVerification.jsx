import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

export default function AddressVerification() {
  const navigate = useNavigate();
  const { addressData, setAddressVerified } = useDeliveryPartner();
  const [form, setForm] = useState({
    house: addressData?.house || "",
    area: addressData?.area || "",
    city: addressData?.city || "",
    district: addressData?.district || "",
    state: addressData?.state || "",
    pinCode: addressData?.pinCode || "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.house.trim()) errs.house = "House/Building is required";
    if (!form.area.trim()) errs.area = "Area is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.district.trim()) errs.district = "District is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.pinCode.trim()) errs.pinCode = "PIN code is required";
    else if (!/^\d{6}$/.test(form.pinCode)) errs.pinCode = "Enter a valid 6-digit PIN code";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setAddressVerified(form);
    navigate("/deliverypartner/onboarding/documents");
  };

  const inputClass = (field) => `w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${errors[field] ? "border-rose-300 bg-rose-50" : "border-gray-200"}`;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h1 className="text-xl font-bold">Address Verification</h1>
          <p className="text-emerald-100 text-sm mt-1">Provide your residential address</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">House / Building</label>
              <input type="text" value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} placeholder="14, Green Avenue" className={inputClass("house")} />
              {errors.house && <p className="text-xs text-rose-500 mt-1">{errors.house}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality</label>
              <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Rajbagh" className={inputClass("area")} />
              {errors.area && <p className="text-xs text-rose-500 mt-1">{errors.area}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Srinagar" className={inputClass("city")} />
              {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input type="text" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Srinagar" className={inputClass("district")} />
              {errors.district && <p className="text-xs text-rose-500 mt-1">{errors.district}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Jammu & Kashmir" className={inputClass("state")} />
              {errors.state && <p className="text-xs text-rose-500 mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
              <input type="text" value={form.pinCode} onChange={(e) => setForm({ ...form, pinCode: e.target.value })} placeholder="190008" maxLength={6} className={inputClass("pinCode")} />
              {errors.pinCode && <p className="text-xs text-rose-500 mt-1">{errors.pinCode}</p>}
            </div>
          </div>

          <button type="button" className="flex items-center gap-2 text-sm text-emerald-600 font-semibold hover:underline">
            <MapPin className="w-4 h-4" /> Use Current Location (Simulated)
          </button>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/deliverypartner/onboarding/identity")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
