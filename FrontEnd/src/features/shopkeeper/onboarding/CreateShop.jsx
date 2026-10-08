import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  ChevronRight,
  Clock,
  FileText,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  Store,
  X,
} from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";
import ShopOnboardingLayout from "./ShopOnboardingLayout";
import LocationPicker from "../../../components/common/LocationPicker";

const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_RE = /^\d{6}$/;

const formatTimeLabel = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes || 0).padStart(2, "0")} ${period}`;
};

const fieldClass = (hasError) =>
  `input-field ${hasError ? "border-rose-300 bg-rose-50/70" : ""}`;

const CreateShop = () => {
  const navigate = useNavigate();
  const { shop, setShop, createShop, uploadImage, setOnboardingStep, profile, actionError } = useShopkeeper();
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    name: shop.name || "",
    description: shop.description || "",
    phone: shop.phone || profile.phone || "",
    email: shop.email || profile.email || "",
    address: shop.address || "",
    city: shop.city || "",
    state: shop.state || "",
    pincode: shop.pincode || "",
    openingTime: shop.openingTime || "09:00",
    closingTime: shop.closingTime || "21:00",
    minOrder: shop.minOrder ?? 99,
    shopImage: shop.shopImage || null,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Exact shop position on the map — required for road-distance delivery pricing.
  const [location, setLocation] = useState(() =>
    shop.lat != null && shop.lng != null ? { lat: Number(shop.lat), lng: Number(shop.lng) } : null
  );

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, shopImage: "Please choose an image file" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, shopImage: "Image must be under 5MB" }));
      return;
    }
    // Keep the File for upload and use an object URL for the local preview only.
    setImageFile(file);
    update("shopImage", URL.createObjectURL(file));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Shop name is required";
    if (form.description.trim().length > 0 && form.description.trim().length < 20) {
      next.description = "Add a short description (at least 20 characters)";
    }
    if (!PHONE_RE.test(form.phone.trim())) next.phone = "Enter a valid 10-digit mobile number";
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email";
    if (!form.address.trim()) next.address = "Address is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.state.trim()) next.state = "State is required";
    if (!PIN_RE.test(form.pincode.trim())) next.pincode = "Enter a 6-digit PIN code";
    if (!location) next.location = "Shop location is not set. Please select your shop location on the map.";
    if (!form.openingTime) next.openingTime = "Opening time is required";
    if (!form.closingTime) next.closingTime = "Closing time is required";
    if (form.openingTime && form.closingTime && form.closingTime <= form.openingTime) {
      next.closingTime = "Closing time must be after opening time";
    }
    if (!Number.isFinite(Number(form.minOrder)) || form.minOrder === "" || Number(form.minOrder) < 0) {
      next.minOrder = "Enter a valid minimum order amount";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleProceed = async () => {
    if (!validate()) return;
    setSaving(true);
    setSubmitError("");

    try {
      // The image must exist as a URL on the server, not as a local preview.
      let shopImage = form.shopImage && form.shopImage.startsWith("http") ? form.shopImage : null;
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, "nearmart/shops");
        if (!uploadedUrl) throw new Error("The shop image upload did not return a URL. Please try again.");
        shopImage = uploadedUrl;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        lat: location.lat,
        lng: location.lng,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        minOrder: Number(form.minOrder) || 0,
        shopImage: shopImage || undefined,
        categoryId: shop.categoryId || undefined,
      };

      const result = shop.id
        ? await setShop(payload)
        : await createShop(payload);

      if (!result?.ok) return;

      setOnboardingStep("documents");
      navigate("/shopkeeper/onboarding/documents");
    } catch (error) {
      setSubmitError(error?.message || "We could not save your shop. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ShopOnboardingLayout
      stepKey="create_shop"
      onBack={() => {
        setOnboardingStep("type_selection");
        navigate("/shopkeeper/onboarding");
      }}
    >
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)]">
        <div className="p-5 sm:p-7 lg:p-8">
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-primary)">
              {shop.type || "Your shop"}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Create your shop</h1>
            <p className="mt-1 text-sm text-(--color-text-muted)">
              Customers will see these details on your public shop page.
            </p>
          </div>

          <div className="space-y-5">
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">Identity</h2>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Shop name *</label>
                <div className="relative">
                  <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Fresh Basket"
                    className={`${fieldClass(errors.name)} pl-11`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                  Description <span className="normal-case tracking-normal text-(--color-text-muted)">{form.description.length}/240</span>
                </label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-(--color-text-muted)" />
                  <textarea
                    value={form.description}
                    maxLength={240}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Tell customers what you sell and why they should order from you."
                    rows={3}
                    className={`${fieldClass(errors.description)} resize-none pl-11`}
                  />
                </div>
                {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Shop photo</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {form.shopImage ? (
                  <div className="relative inline-block">
                    <img src={form.shopImage} alt="Shop preview" className="h-28 w-28 rounded-[12px] object-cover" />
                    <button
                      type="button"
                      onClick={() => update("shopImage", null)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-1 rounded-[12px] border border-dashed border-[#dce8e2] bg-[#f8fbf9] px-4 py-6 text-(--color-text-muted) hover:border-(--color-primary)"
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-sm font-medium">Upload shop image</span>
                    <span className="text-xs">JPG or PNG, up to 5MB</span>
                  </button>
                )}
                {errors.shopImage && <p className="mt-1 text-xs text-rose-600">{errors.shopImage}</p>}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">Contact</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Phone *</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                    <input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`${fieldClass(errors.phone)} pl-11`}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="shop@example.com"
                      className={`${fieldClass(errors.email)} pl-11`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">Location</h2>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Street address *</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-(--color-text-muted)" />
                  <textarea
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="Shop no., street, landmark"
                    rows={2}
                    className={`${fieldClass(errors.address)} resize-none pl-11`}
                  />
                </div>
                {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">City *</label>
                  <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Srinagar" className={fieldClass(errors.city)} />
                  {errors.city && <p className="mt-1 text-xs text-rose-600">{errors.city}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">State *</label>
                  <input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="Jammu & Kashmir" className={fieldClass(errors.state)} />
                  {errors.state && <p className="mt-1 text-xs text-rose-600">{errors.state}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">PIN code *</label>
                  <input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} placeholder="190001" maxLength={6} className={fieldClass(errors.pincode)} />
                  {errors.pincode && <p className="mt-1 text-xs text-rose-600">{errors.pincode}</p>}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Shop location on the map *</label>
                <LocationPicker
                  label="Pin your shop's exact spot"
                  hint="Search for the area or tap the map — customers are priced by the real road distance from this point."
                  value={location}
                  onChange={(next) => {
                    setLocation(next);
                    if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
                  }}
                  onAddressChange={(place) => {
                    if (!place) return;
                    setForm((prev) => ({
                      ...prev,
                      address: prev.address || place.line1 || "",
                      city: prev.city || place.city || "",
                      state: prev.state || place.state || "",
                      pincode: prev.pincode || place.pincode || "",
                    }));
                  }}
                  mapHeight="h-64 sm:h-72"
                />
                {errors.location && <p className="mt-1 text-xs text-rose-600">{errors.location}</p>}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">Operations</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Opens *</label>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                    <input type="time" value={form.openingTime} onChange={(e) => update("openingTime", e.target.value)} className={`${fieldClass(errors.openingTime)} pl-11`} />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Closes *</label>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                    <input type="time" value={form.closingTime} onChange={(e) => update("closingTime", e.target.value)} className={`${fieldClass(errors.closingTime)} pl-11`} />
                  </div>
                  {errors.closingTime && <p className="mt-1 text-xs text-rose-600">{errors.closingTime}</p>}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Minimum order (₹) *</label>
                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.minOrder}
                    onChange={(e) => update("minOrder", e.target.value)}
                    className={`${fieldClass(errors.minOrder)} pl-11`}
                  />
                </div>
                {errors.minOrder && <p className="mt-1 text-xs text-rose-600">{errors.minOrder}</p>}
              </div>
            </section>
          </div>

          {(submitError || actionError) && (
            <div className="mt-5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError || actionError}
            </div>
          )}

          <button type="button" onClick={handleProceed} disabled={saving} className="btn-primary mt-6 w-full">
            {saving ? "Saving shop..." : "Continue to documents"}
            {!saving && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <aside className="border-t border-(--color-green-soft) bg-(--color-green-bg)/50 p-5 sm:p-7 lg:sticky lg:top-6 lg:border-l lg:border-t-0 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">Live preview</p>
          <div className="mt-3 overflow-hidden rounded-[16px] border border-white bg-white shadow-[var(--shadow-card)]">
            <div className="h-28 bg-(--color-green-soft)">
              {form.shopImage ? (
                <img src={form.shopImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-(--color-primary)">
                  <Store className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-(--color-primary)">
                {shop.type || "Shop type"}
              </p>
              <h3 className="mt-1 text-lg font-bold">{form.name || "Your shop name"}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-(--color-text-muted)">
                {form.description || "Your shop description will appear here."}
              </p>
              <div className="mt-3 space-y-1 text-xs text-(--color-text-muted)">
                <p>{form.address || "Street address"}{form.city ? `, ${form.city}` : ""}</p>
                <p>
                  {formatTimeLabel(form.openingTime)} – {formatTimeLabel(form.closingTime)}
                </p>
                <p>Min. order ₹{Number(form.minOrder) || 0}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </ShopOnboardingLayout>
  );
};

export default CreateShop;
