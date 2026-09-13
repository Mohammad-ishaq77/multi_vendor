import { useState } from "react";
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
  Mail,
  Phone,
  Building2,
  Landmark,
  Hash,
  Check,
  X,
  Pencil,
} from "lucide-react";
import CustomerShell from "../components/CustomerShell";

const EMPTY_ADDRESS = {
  fullName: "",
  email: "",
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
  const [addresses, setAddresses] = useState(() =>
    JSON.parse(localStorage.getItem("nearmart_addresses") || "[]")
  );
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [defaultIndex, setDefaultIndex] = useState(() => {
    const stored = Number(localStorage.getItem("nearmart_default_address"));
    return Number.isInteger(stored) ? stored : 0;
  });

  const setDefaultAddress = (index) => {
    setDefaultIndex(index);
    localStorage.setItem("nearmart_default_address", String(index));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
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

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    let next;
    if (editingIndex !== null) {
      next = addresses.map((a, i) => (i === editingIndex ? { ...form } : a));
      setEditingIndex(null);
    } else {
      next = [...addresses, { ...form }];
    }
    setAddresses(next);
    localStorage.setItem("nearmart_addresses", JSON.stringify(next));
    setForm(EMPTY_ADDRESS);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (index) => {
    setForm(addresses[index]);
    setEditingIndex(index);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = (index) => {
    const next = addresses.filter((_, i) => i !== index);
    setAddresses(next);
    let nextDefault = defaultIndex;
    if (index < nextDefault) nextDefault -= 1;
    if (index === defaultIndex || nextDefault >= next.length) nextDefault = 0;
    setDefaultAddress(nextDefault);
    localStorage.setItem("nearmart_addresses", JSON.stringify(next));
    if (editingIndex === index) {
      setEditingIndex(null);
      setForm(EMPTY_ADDRESS);
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
    setForm(EMPTY_ADDRESS);
    setErrors({});
  };

  const inputClass = (field) =>
    `w-full bg-gray-50 border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:bg-white focus:ring-2 ${
      errors[field]
        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-50"
        : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-50"
    }`;

  return (
    <CustomerShell>
      <div className="min-h-screen bg-[#fafcfb]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">My Addresses</h1>
                <p className="text-xs text-gray-400 mt-0.5">Manage your delivery locations</p>
              </div>
              {!showForm && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Address
                </motion.button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* Mobile Add Button */}
          {!showForm && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="sm:hidden w-full mb-5 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20"
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
                className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-lg shadow-emerald-900/5 mb-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-gray-900">
                    {editingIndex !== null ? "Edit Address" : "Add New Address"}
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
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
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
                    <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" className={inputClass("email")} />
                    </div>
                    {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
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
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-5">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {editingIndex !== null ? "Update" : "Save Address"}
                  </motion.button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-3 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Address Cards */}
          {addresses.length === 0 && !showForm ? (
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
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
              >
                Add Address
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {addresses.map((addr, index) => {
                  const cfg = typeConfig[addr.type] || typeConfig.other;
                  const TypeIcon = cfg.icon;
                  const isDefault = defaultIndex === index;

                  return (
                    <motion.div
                      key={`${addr.email}-${index}`}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`relative bg-white rounded-2xl border p-5 transition-all duration-300 ${
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
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${cfg.color}`}>
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
                            <div className="flex items-center gap-3 pt-1">
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Phone className="w-3 h-3" /> {addr.phone}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Mail className="w-3 h-3" /> {addr.email}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {!isDefault && (
                            <button
                              onClick={() => setDefaultAddress(index)}
                              className="text-xs font-semibold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Set Default
                            </button>
                          )}
                          <div className="flex gap-1">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(index)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(index)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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
          )}
        </div>
      </div>
    </CustomerShell>
  );
};

export default Addresses;