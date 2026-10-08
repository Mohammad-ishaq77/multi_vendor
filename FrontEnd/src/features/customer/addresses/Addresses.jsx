import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Building,
  BadgeCheck,
  Navigation,
  User,
  Phone,
  Building2,
  Landmark,
  Hash,
  Check,
  X,
  Pencil,
  Loader2,
  AlertCircle,
} from "lucide-react";
import CustomerShell from "../components/CustomerShell";
import LocationPicker from "../../../components/common/LocationPicker";
import { useToast } from "../../../components/common/Toast";
import { addressService } from "../../../services/accountService";
import { normalizeAddresses } from "../../../utils/normalize";

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  type: "home",
};

const typeConfig = {
  home: { icon: Home, label: "Home", color: "bg-blue-50 text-blue-600 border-blue-100", activeBg: "bg-blue-600 text-white" },
  work: { icon: Briefcase, label: "Work", color: "bg-amber-50 text-amber-600 border-amber-100", activeBg: "bg-amber-600 text-white" },
  other: { icon: Building, label: "Other", color: "bg-purple-50 text-purple-600 border-purple-100", activeBg: "bg-purple-600 text-white" },
};

const Addresses = () => {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setAddresses(normalizeAddresses(await addressService.list()));
    } catch (error) {
      setLoadError(error?.message || "We could not load your saved addresses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "10 digits";
    if (!form.street.trim()) e.street = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!form.pincode.trim()) e.pincode = "Required";
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "6 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  /** Reverse-geocoded parts — only fill fields the user left blank. */
  const handlePlaceChange = (next) => {
    if (!next) return;
    setForm((prev) => ({
      ...prev,
      street: prev.street || next.line1 || "",
      city: prev.city || next.city || "",
      state: prev.state || next.state || "",
      pincode: prev.pincode || next.pincode || "",
    }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    if (!location) {
      setLocationError("Please select your delivery location on the map.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        line1: form.street.trim(),
        line2: "",
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        label: typeConfig[form.type].label,
        lat: location.lat,
        lng: location.lng,
      };

      if (editingId) {
        await addressService.update(editingId, payload);
        showToast("Address updated");
      } else {
        await addressService.create({ ...payload, isDefault: addresses.length === 0 });
        showToast("Address saved");
      }

      await load();
      handleCancel();
    } catch (error) {
      showToast(error?.message || "We could not save that address.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr) => {
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: typeConfig[addr.type] ? addr.type : "other",
    });
    setLocation(addr.hasLocation ? { lat: addr.lat, lng: addr.lng } : null);
    setLocationError(addr.hasLocation ? "" : "Please select your delivery location on the map.");
    setEditingId(addr.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (addr) => {
    const previous = addresses;
    setAddresses((prev) => prev.filter((item) => item.id !== addr.id));
    setBusyId(addr.id);
    try {
      await addressService.remove(addr.id);
      showToast("Address removed");
      if (editingId === addr.id) handleCancel();
    } catch (error) {
      setAddresses(previous);
      showToast(error?.message || "We could not delete that address.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (addr) => {
    setBusyId(addr.id);
    try {
      await addressService.setDefault(addr.id);
      setAddresses((prev) => prev.map((item) => ({ ...item, isDefault: item.id === addr.id })));
      showToast("Default address updated");
    } catch (error) {
      showToast(error?.message || "We could not update the default address.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_ADDRESS);
    setLocation(null);
    setLocationError("");
    setErrors({});
  };

  const inputClass = (field) =>
    `w-full bg-gray-50 border rounded-md py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:bg-white focus:ring-2 ${
      errors[field]
        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-50"
        : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-50"
    }`;

  return (
    <CustomerShell>
      <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">Manage your delivery locations</p>
              {!showForm && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Address
                </motion.button>
              )}
            </div>

          {/* Mobile Add Button */}
          {!showForm && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="sm:hidden w-full mb-5 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-md font-semibold text-sm shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              Add New Address
            </motion.button>
          )}

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="bg-white border border-gray-100 rounded-lg p-5 sm:p-6 shadow-lg shadow-emerald-900/5 mb-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-gray-900">
                    {editingId ? "Edit Address" : "Add New Address"}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Type Selector */}
                <div className="flex gap-2 mb-5">
                  {["home", "work", "other"].map((type) => {
                    const cfg = typeConfig[type];
                    const Icon = cfg.icon;
                    const active = form.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, type }))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all border ${
                          active
                            ? `${cfg.activeBg} border-transparent shadow-sm`
                            : "border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Form Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" className={inputClass("fullName")} />
                    </div>
                    {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" maxLength={10} className={inputClass("phone")} />
                    </div>
                    {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pincode</label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="190001" maxLength={6} className={inputClass("pincode")} />
                    </div>
                    {errors.pincode && <p className="text-xs text-rose-500 mt-1">{errors.pincode}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Street Address</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <textarea name="street" value={form.street} onChange={handleChange} placeholder="House No, Building, Street, Area..." rows={2} className={inputClass("street") + " resize-none"} />
                    </div>
                    {errors.street && <p className="text-xs text-rose-500 mt-1">{errors.street}</p>}
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="city" value={form.city} onChange={handleChange} placeholder="Srinagar" className={inputClass("city")} />
                    </div>
                    {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                    <div className="relative">
                      <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="state" value={form.state} onChange={handleChange} placeholder="Jammu & Kashmir" className={inputClass("state")} />
                    </div>
                    {errors.state && <p className="text-xs text-rose-500 mt-1">{errors.state}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Delivery location on the map *
                    </label>
                    <LocationPicker
                      label="Drop the pin where we should deliver"
                      hint="Search your area or tap the map — this exact point is used to price delivery by road distance."
                      value={location}
                      onChange={(next) => {
                        setLocation(next);
                        if (locationError) setLocationError("");
                      }}
                      onAddressChange={handlePlaceChange}
                      mapHeight="h-64 sm:h-72"
                    />
                    {locationError && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                        <AlertCircle className="h-3.5 w-3.5" /> {locationError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-5">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-md font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {saving ? "Saving…" : editingId ? "Update" : "Save Address"}
                  </motion.button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-3 border border-gray-200 rounded-md font-semibold text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your addresses…
            </div>
          )}

          {loadError && !loading && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <span>{loadError}</span>
              <button onClick={load} className="font-semibold underline">
                Retry
              </button>
            </div>
          )}

          {/* Address Cards */}
          {!loading && !loadError && addresses.length === 0 && !showForm ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5 border border-gray-100"
              >
                <Navigation className="w-9 h-9 text-gray-300" />
              </motion.div>
              <h3 className="font-bold text-gray-900">No saved addresses</h3>
              <p className="text-sm text-gray-500 mt-1 mb-5">Add your delivery address to get started.</p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-md font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
              >
                Add Address
              </motion.button>
            </motion.div>
          ) : (
            !loading &&
            !loadError && (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {addresses.map((addr) => {
                    const cfg = typeConfig[addr.type] || typeConfig.other;
                    const TypeIcon = cfg.icon;
                    const isDefault = addr.isDefault;

                    return (
                      <motion.div
                        key={addr.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`relative bg-white rounded-lg border p-5 transition-all duration-300 ${
                          isDefault
                            ? "border-emerald-200 shadow-lg shadow-emerald-900/5"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                        }`}
                      >
                        {isDefault && (
                          <div className="absolute -top-2.5 left-5 bg-emerald-600 text-white text-[0.6rem] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <BadgeCheck className="w-3 h-3" />
                            Default
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 border ${cfg.color}`}>
                              <TypeIcon className="w-4.5 h-4.5" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-900 text-sm">{addr.fullName}</h3>
                                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-md border ${cfg.color}`}>
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{addr.street}</p>
                              <p className="text-sm text-gray-500">
                                {addr.city}, {addr.state} — {addr.pincode}
                              </p>
                              <span className="flex items-center gap-1 text-xs text-gray-400 pt-1">
                                <Phone className="w-3 h-3" /> {addr.phone}
                              </span>
                              {!addr.hasLocation && (
                                <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-700">
                                  <AlertCircle className="h-3 w-3" /> No map location yet — edit to set it
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {!isDefault && (
                              <button
                                onClick={() => handleSetDefault(addr)}
                                disabled={busyId === addr.id}
                                className="text-xs font-semibold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                              >
                                Set Default
                              </button>
                            )}
                            <div className="flex gap-1">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(addr)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(addr)}
                                disabled={busyId === addr.id}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-60"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )
          )}
      </div>
    </CustomerShell>
  );
};

export default Addresses;
