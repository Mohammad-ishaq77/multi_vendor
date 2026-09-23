import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Tag, Percent, IndianRupee, Calendar, BarChart3 } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

const emptyOffer = { name: "", description: "", couponCode: "", discountType: "percentage", discountValue: "", minOrder: "", maxDiscount: "", startDate: "", endDate: "", usageLimit: "" };

export default function Offers() {
  const { offers, createOffer, activateOffer, deactivateOffer, deleteOffer } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyOffer);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    let result = offers || [];
    if (statusFilter === "active") result = result.filter((o) => o.status === "active");
    else if (statusFilter === "inactive") result = result.filter((o) => o.status === "inactive");
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.name.toLowerCase().includes(q) || o.couponCode.toLowerCase().includes(q));
    }
    return result;
  }, [offers, search, statusFilter]);

  const handleCreate = () => {
    if (!form.name || !form.couponCode || !form.discountValue) return;
    createOffer({
      ...form,
      id: `OFF-${Date.now()}`,
      discountValue: Number(form.discountValue),
      minOrder: Number(form.minOrder) || 0,
      maxDiscount: Number(form.maxDiscount) || 0,
      usageLimit: Number(form.usageLimit) || 100,
      usedCount: 0,
      status: "active",
      createdBy: "admin",
    });
    setForm(emptyOffer);
    setShowForm(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#14261f]">Offers & Promotions</h1>
            <p className="text-sm text-gray-500 mt-1">Create and manage promotional offers and discounts.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-[#155c43] text-white text-sm font-semibold rounded-md hover:bg-[#155c43]/90 transition-colors shadow-lg shadow-[#155c43]/20">
            <Plus className="w-4 h-4" /> Create Offer
          </button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">New Offer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Offer Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" placeholder="e.g. Summer Sale" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Coupon Code *</label><input value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none uppercase" placeholder="e.g. SUMMER20" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Discount Type</label><select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm bg-white"><option value="percentage">Percentage (%)</option><option value="flat">Flat (₹)</option></select></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Discount Value *</label><input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 50"} /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Min Order (₹)</label><input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" placeholder="0" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Max Discount (₹)</label><input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" placeholder="0" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" placeholder="Optional description" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Usage Limit</label><input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" placeholder="100" /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCreate} className="px-5 py-2 bg-[#155c43] text-white text-sm font-semibold rounded-md hover:bg-[#155c43]/90 transition-colors">Create Offer</button>
              <button onClick={() => { setShowForm(false); setForm(emptyOffer); }} className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search offers..." className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-200 text-sm focus:border-[#155c43] outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-md border border-gray-200 text-sm bg-white">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((offer) => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{offer.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{offer.couponCode}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold ${offer.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                  {offer.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-2 text-xs text-gray-600 mb-4">
                <div className="flex items-center gap-2">{offer.discountType === "percentage" ? <Percent className="w-3.5 h-3.5 text-gray-400" /> : <IndianRupee className="w-3.5 h-3.5 text-gray-400" />}<span>{offer.discountType === "percentage" ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}{offer.maxDiscount > 0 ? ` (max ₹${offer.maxDiscount})` : ""}</span></div>
                {offer.minOrder > 0 && <div className="flex items-center gap-2"><IndianRupee className="w-3.5 h-3.5 text-gray-400" /><span>Min order: ₹{offer.minOrder}</span></div>}
                {offer.startDate && <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span>{offer.startDate} to {offer.endDate || "No end"}</span></div>}
                <div className="flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-gray-400" /><span>{offer.usedCount || 0}/{offer.usageLimit || "∞"} used</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => offer.status === "active" ? deactivateOffer(offer.id) : activateOffer(offer.id)} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${offer.status === "active" ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
                  {offer.status === "active" ? "Deactivate" : "Activate"}
                </button>
                {confirmDelete === offer.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => { deleteOffer(offer.id); setConfirmDelete(null); }} className="px-3 py-1.5 text-xs font-semibold bg-rose-500 text-white rounded-lg">Yes</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg">No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(offer.id)} className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors">Delete</button>
                )}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-16"><Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400">No offers found.</p></div>}
        </div>
      </div>
    </PageTransition>
  );
}
