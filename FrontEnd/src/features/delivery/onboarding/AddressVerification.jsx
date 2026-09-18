import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, MapPin } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

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
    aadhaarAddressMatch: addressData?.aadhaarAddressMatch || false,
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
    if (!form.aadhaarAddressMatch)
      errs.aadhaarAddressMatch = "Confirm that this address matches your Aadhaar information";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setAddressVerified(form);
    navigate("/delivery/onboarding/documents");
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 rounded-md border text-sm outline-none transition-all duration-200 ${
      errors[field]
        ? "border-rose-300 bg-rose-50/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        : "border-gray-200 bg-[#F8FAFC] focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10 focus:bg-white"
    }`;

  return (
    <OnboardingLayout>
      <div className="p-5 sm:p-6 space-y-5">
        {/* Title */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-[#1B4332]/10 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6 text-[#1B4332]" />
          </div>
          <h1 className="font-serif text-xl font-bold text-[#0F172A]">
            Address Verification
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Provide your residential address
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3.5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#0F172A]">House / Building</label>
            <input
              type="text"
              value={form.house}
              onChange={(e) => setForm({ ...form, house: e.target.value })}
              placeholder="14, Green Avenue"
              className={inputClass("house")}
            />
            {errors.house && <p className="text-xs text-rose-500">{errors.house}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#0F172A]">Area / Locality</label>
            <input
              type="text"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              placeholder="Rajbagh"
              className={inputClass("area")}
            />
            {errors.area && <p className="text-xs text-rose-500">{errors.area}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#0F172A]">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Srinagar"
                className={inputClass("city")}
              />
              {errors.city && <p className="text-xs text-rose-500">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#0F172A]">District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                placeholder="Srinagar"
                className={inputClass("district")}
              />
              {errors.district && <p className="text-xs text-rose-500">{errors.district}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#0F172A]">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="Jammu & Kashmir"
                className={inputClass("state")}
              />
              {errors.state && <p className="text-xs text-rose-500">{errors.state}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#0F172A]">PIN Code</label>
              <input
                type="text"
                value={form.pinCode}
                onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                placeholder="190008"
                maxLength={6}
                className={inputClass("pinCode")}
              />
              {errors.pinCode && <p className="text-xs text-rose-500">{errors.pinCode}</p>}
            </div>
          </div>
        </div>

        {/* Aadhaar confirmation */}
        <label className="flex items-start gap-3 p-3.5 bg-[#1B4332]/[0.04] border border-[#1B4332]/10 rounded-md cursor-pointer hover:border-[#1B4332]/20 transition-colors">
          <input
            type="checkbox"
            checked={form.aadhaarAddressMatch}
            onChange={(e) => setForm({ ...form, aadhaarAddressMatch: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1B4332] focus:ring-[#1B4332]"
          />
          <span className="text-sm text-[#334155] font-medium leading-snug">
            I confirm that my current address matches the address on my Aadhaar document.
          </span>
        </label>
        {errors.aadhaarAddressMatch && (
          <p className="text-xs text-rose-500">{errors.aadhaarAddressMatch}</p>
        )}

        {/* Continue */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold bg-[#1B4332] text-white hover:bg-[#143728] shadow-lg shadow-[#1B4332]/20 transition-all"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </OnboardingLayout>
  );
}
