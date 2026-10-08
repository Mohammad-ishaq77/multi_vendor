import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";
import { uploadService } from "../../../services/catalogService";

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-md py-3 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50";
const OTHER_CATEGORY = "other";

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct, shopTypes, shop } = useShopkeeper();
  const [form, setForm] = useState({
    name: "", categoryId: "", description: "", price: "", discount: "", stock: "", unit: "kg", image: "", available: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitStage, setSubmitStage] = useState("");
  const [error, setError] = useState("");

  const categories = useMemo(
    () => shopTypes || [],
    [shopTypes]
  );

  // The API keys products by category id, so the picker uses the real categories.
  useEffect(() => {
    if (form.categoryId || !categories.length) return;
    const shopCategory = categories.find((c) => c.id === shop?.categoryId);
    const initial = shopCategory || categories[0];
    setForm((prev) => ({ ...prev, categoryId: initial?.id || "" }));
  }, [categories, form.categoryId, shop?.categoryId]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImagePreview(reader.result); update("image", file); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    let currentStage = form.image instanceof File ? "Uploading product image..." : "Saving product...";
    setSubmitStage(currentStage);
    setError("");
    try {
      let imageUrl = null;
      if (form.image instanceof File) {
        const uploaded = await uploadService.image(form.image, "nearmart/products");
        imageUrl = uploaded?.url || null;
        if (!imageUrl) throw new Error("The image upload did not return a usable URL.");
      }
      currentStage = "Saving product...";
      setSubmitStage(currentStage);
      const result = await addProduct({
        ...form,
        categoryId: form.categoryId === OTHER_CATEGORY ? null : form.categoryId || null,
        imageUrl,
        price: Number(form.price),
        discount: Number(form.discount) || 0,
        stock: Number(form.stock) || 0,
      });
      if (!result?.ok) {
        const validationDetails = result?.issues
          ?.map((issue) => `${issue.path}: ${issue.message}`)
          .join(" ");
        const isConnectionFailure = [0, 502, 503, 504].includes(result?.status);
        const failureContext = currentStage.startsWith("Uploading")
          ? " while uploading the product image"
          : " while saving the product";
        const connectionHelp = isConnectionFailure
          ? `${failureContext}. Check that the backend is running on port 5000 and the Vite /api proxy is available. If the save timed out, check your product list before submitting again.`
          : "";
        setError(validationDetails || `${result?.error || "We could not save this product."}${connectionHelp}`);
        return;
      }
      navigate("/shopkeeper/products");
    } catch (err) {
      const validationDetails = err?.issues
        ?.map((issue) => `${issue.path}: ${issue.message}`)
        .join(" ");
      const isConnectionFailure = err?.status === 0 || err?.status === 502 || err?.status === 503 || err?.status === 504;
      const failureContext = currentStage.startsWith("Uploading")
        ? " while uploading the product image"
        : " while saving the product";
      const connectionHelp = isConnectionFailure
        ? `${failureContext}. Check that the backend is running on port 5000 and the Vite /api proxy is available. If the save timed out, check your product list before submitting again.`
        : "";
      setError(validationDetails || `${err?.message || "We could not save this product."}${connectionHelp}`);
    } finally {
      setSaving(false);
      setSubmitStage("");
    }
  };

  const units = ["kg", "g", "ml", "L", "pcs", "Pack", "Dozen", "Box", "Bottle"];

  return (
    <ShopkeeperShell>
      <div className="w-full">
        <button onClick={() => navigate("/shopkeeper/products")} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1">Add Product</h1>
        <p className="text-sm text-gray-500 mb-6">Add a new product to your shop inventory.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Product Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Name *</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Fresh Tomatoes" className={inputClass} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} className={inputClass}>
                    <option value={OTHER_CATEGORY}>Other</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {form.categoryId === OTHER_CATEGORY && (
                    <p className="mt-1.5 text-xs text-gray-500">This product will not appear in a customer category.</p>
                  )}
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
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Product description..." rows={3} className={inputClass + " resize-none"} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Pricing & Stock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price (₹) *</label>
                <input type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0" className={inputClass} required />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Discount (%)</label>
                <input type="number" min="0" max="100" step="0.01" value={form.discount} onChange={(e) => update("discount", e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stock</label>
                <input type="number" min="0" step="1" value={form.stock} onChange={(e) => update("stock", e.target.value)} placeholder="0" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Product Image</h3>
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImagePreview(null); update("image", ""); }} className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-rose-500 shadow-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-md p-8 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Click to upload image</span>
                <span className="text-xs text-gray-400">JPG, PNG (max 5MB)</span>
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex items-center gap-3">
            {error && (
              <p role="alert" className="flex-1 text-sm text-rose-600">{error}</p>
            )}
            <motion.button whileTap={{ scale: 0.98 }} type="button" onClick={() => navigate("/shopkeeper/products")} className="px-5 py-3 rounded-md text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </motion.button>
            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={saving || !form.name || !form.price} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-md font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50">
              {saving ? <>{submitStage || "Saving..."}<div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></> : <><Save className="w-4 h-4" /> Add Product</>}
            </motion.button>
          </div>
        </form>
      </div>
    </ShopkeeperShell>
  );
};

export default AddProduct;
