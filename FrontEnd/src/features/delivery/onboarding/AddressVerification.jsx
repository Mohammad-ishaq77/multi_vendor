import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Sparkles } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import OnboardingLayout from "./OnboardingLayout";

const AADHAAR_ADDRESS = {
  house: "14, Green Avenue",
  area: "Rajbagh",
  city: "Srinagar",
  district: "Srinagar",
  state: "Jammu & Kashmir",
  pinCode: "190008",
  aadhaarAddressMatch: true,
};

const fieldClass = (error) => `input-field ${error ? "border-rose-300 bg-rose-50/70" : ""}`;

export default function AddressVerification() {
  const navigate = useNavigate();
  const { addressData, setAddressVerified, updateOnboardingStep } = useDeliveryPartner();
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

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.house.trim()) next.house = "House / building is required";
    if (!form.area.trim()) next.area = "Area is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.district.trim()) next.district = "District is required";
    if (!form.state.trim()) next.state = "State is required";
    if (!/^\d{6}$/.test(form.pinCode.trim())) next.pinCode = "Enter a valid 6-digit PIN code";
    if (!form.aadhaarAddressMatch) next.aadhaarAddressMatch = "Confirm this matches your Aadhaar address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setAddressVerified(form);
    updateOnboardingStep("documents");
    navigate("/delivery/onboarding/documents");
  };

  return (
    <OnboardingLayout>
      <div className="space-y-5 p-5 sm:p-7 lg:p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-(--color-green-bg) text-(--color-primary)">
            <MapPin className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-bold">Where do you stay?</h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">We assign nearby pickups from this address.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setForm(AADHAAR_ADDRESS);
            setErrors({});
          }}
          className="btn-secondary w-full"
        >
          <Sparkles className="h-4 w-4" />
          Use address from Aadhaar
        </button>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">House / building</label>
            <input value={form.house} onChange={(e) => update("house", e.target.value)} placeholder="14, Green Avenue" className={fieldClass(errors.house)} />
            {errors.house && <p className="mt-1 text-xs text-rose-600">{errors.house}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Area / locality</label>
            <input value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="Rajbagh" className={fieldClass(errors.area)} />
            {errors.area && <p className="mt-1 text-xs text-rose-600">{errors.area}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">City</label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Srinagar" className={fieldClass(errors.city)} />
              {errors.city && <p className="mt-1 text-xs text-rose-600">{errors.city}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">District</label>
              <input value={form.district} onChange={(e) => update("district", e.target.value)} placeholder="Srinagar" className={fieldClass(errors.district)} />
              {errors.district && <p className="mt-1 text-xs text-rose-600">{errors.district}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">State</label>
              <input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="Jammu & Kashmir" className={fieldClass(errors.state)} />
              {errors.state && <p className="mt-1 text-xs text-rose-600">{errors.state}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">PIN code</label>
              <input value={form.pinCode} onChange={(e) => update("pinCode", e.target.value)} placeholder="190008" maxLength={6} className={fieldClass(errors.pinCode)} />
              {errors.pinCode && <p className="mt-1 text-xs text-rose-600">{errors.pinCode}</p>}
            </div>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-[#dce8e2] bg-[#f8fbf9] p-3.5">
          <input
            type="checkbox"
            checked={form.aadhaarAddressMatch}
            onChange={(e) => update("aadhaarAddressMatch", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#dce8e2] accent-(--color-primary)"
          />
          <span className="text-sm font-medium">This is the same as my Aadhaar address</span>
        </label>
        {errors.aadhaarAddressMatch && <p className="text-xs text-rose-600">{errors.aadhaarAddressMatch}</p>}

        <button type="button" onClick={handleSave} className="btn-primary w-full">
          Continue
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </OnboardingLayout>
  );
}
