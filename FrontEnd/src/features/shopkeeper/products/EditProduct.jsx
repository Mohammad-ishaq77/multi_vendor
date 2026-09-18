import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, CheckCircle2, X } from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, updateProduct } = useShopkeeper();
  const product = products.find((p) => p.id === id);
  const [form, setForm] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({ ...product });
      setImagePreview(product.image || null);
    }
  }, [product]);

  if (!product || !form) {
    return (
      <ShopkeeperShell>
        <div className="text-center py-16">
          <p className="text-gray-500">Product not found.</p>
          <button onClick={() => navigate("/shopkeeper/products")} className="mt-4 text-emerald-600 font-semibold text-sm hover:underline">Back to Products</button>
        </div>
      </ShopkeeperShell>
    );
  }

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImagePreview(reader.result); update("image", reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateProduct(id, { ...form, price: Number(form.price), discount: Number(form.discount) || 0, stock: Number(form.stock) || 0 });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const categories = ["Vegetables", "Fruits", "Dairy", "Bakery", "Grocery", "Snacks", "Beverages", "Meat", "Other"];
  const units = ["kg", "g", "ml", "L", "pcs", "Pack", "Dozen", "Box", "Bottle"];

  return (
    <ShopkeeperShell>
      <div className="w-full">
        <button onClick={() => navigate("/shopkeeper/products")} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1">Edit Product</h1>
        <p className="text-sm text-gray-500 mb-6">Update product information and pricing.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Product Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Name *</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Unit</label>
                  <select value={form.unit} onChange={(e) => update("unit", e.target.value)} className={inputClass}>
                    {units.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className={inputClass + " resize-none"} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Pricing & Stock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price (₹) *</label>
                <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Discount (%)</label>
                <input type="number" value={form.discount} onChange={(e) => update("discount", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stock</label>
                <input type="number" value={form.stock} onChange={(e) => update("stock", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Product Image</h3>
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImagePreview(null); update("image", ""); }} className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-rose-500 shadow-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Click to upload image</span>
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.98 }} type="button" onClick={() => navigate("/shopkeeper/products")} className="px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </motion.button>
            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50">
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </motion.button>
          </div>
        </form>
      </div>
    </ShopkeeperShell>
  );
};

export default EditProduct;
