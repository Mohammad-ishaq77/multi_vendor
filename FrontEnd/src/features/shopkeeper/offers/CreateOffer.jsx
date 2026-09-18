import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Tag, Calendar, ShoppingBag } from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50";

const CreateOffer = () => {
  const navigate = useNavigate();
  const { addOffer, products } = useShopkeeper();
  const [form, setForm] = useState({
    title: "", description: "", type: "percentage", value: "", minOrder: "", maxDiscount: "", validFrom: "", validTill: "", usageLimit: "", productSpecific: false, selectedProducts: [], active: true,
  });
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleProduct = (name) => {
    setForm((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(name)
        ? prev.selectedProducts.filter((p) => p !== name)
        : [...prev.selectedProducts, name],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.value) return;
    setSaving(true);
    setTimeout(() => {
      addOffer({
        ...form,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        usageLimit: Number(form.usageLimit) || 100,
        products: form.productSpecific ? form.selectedProducts : [],
      });
      navigate("/shopkeeper/offers");
    }, 500);
  };

  return (
    <ShopkeeperShell>
      <div className="w-full">
        <button onClick={() => navigate("/shopkeeper/offers")} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Offers
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1">Create Offer</h1>
        <p className="text-sm text-gray-500 mb-6">Set up a new discount or promotional offer.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Tag className="w-4 h-4 text-emerald-600" /> Offer Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Offer Title *</label>
                <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. 10% Off on Groceries" className={inputClass} required />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe your offer..." rows={2} className={inputClass + " resize-none"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Discount Type</label>
                  <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{form.type === "percentage" ? "Discount %" : "Discount ₹"} *</label>
                  <input type="number" value={form.value} onChange={(e) => update("value", e.target.value)} placeholder="0" className={inputClass} required />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-blue-600" /> Conditions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Min Order (₹)</label>
                <input type="number" value={form.minOrder} onChange={(e) => update("minOrder", e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max Discount (₹)</label>
                <input type="number" value={form.maxDiscount} onChange={(e) => update("maxDiscount", e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Usage Limit</label>
                <input type="number" value={form.usageLimit} onChange={(e) => update("usageLimit", e.target.value)} placeholder="100" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-violet-600" /> Validity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
                <input type="date" value={form.validFrom} onChange={(e) => update("validFrom", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                <input type="date" value={form.validTill} onChange={(e) => update("validTill", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Specific</h3>
              <button type="button" onClick={() => update("productSpecific", !form.productSpecific)} className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${form.productSpecific ? "bg-emerald-500" : "bg-gray-300"}`}>
                <motion.div animate={{ x: form.productSpecific ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
            {form.productSpecific && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-wrap gap-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      form.selectedProducts.includes(p.name) ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.98 }} type="button" onClick={() => navigate("/shopkeeper/offers")} className="px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </motion.button>
            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={saving || !form.title || !form.value} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50">
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Create Offer</>}
            </motion.button>
          </div>
        </form>
      </div>
    </ShopkeeperShell>
  );
};

export default CreateOffer;
