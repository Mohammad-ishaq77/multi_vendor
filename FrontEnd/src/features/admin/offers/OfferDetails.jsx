import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Tag, Percent, IndianRupee, Calendar, BarChart3, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageTransition from "../components/PageTransition";

export default function OfferDetails() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const { offers, activateOffer, deactivateOffer, deleteOffer } = useAdmin();
  const offer = offers?.find((o) => o.id === offerId);

  if (!offer) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Offer not found</h2>
          <Link to="/admin/offers" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#155c43] hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Offers</Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/offers")} className="w-10 h-10 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#155c43] hover:border-emerald-200 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#14261f]">{offer.name}</h1>
            <p className="text-sm text-gray-500">Offer details and management</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${offer.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
            {offer.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Offer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Coupon Code</p><p className="text-sm font-bold text-[#155c43]">{offer.couponCode}</p></div>
            <div><p className="text-xs text-gray-500">Discount</p><p className="text-sm font-bold">{offer.discountType === "percentage" ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}</p></div>
            {offer.maxDiscount > 0 && <div><p className="text-xs text-gray-500">Max Discount</p><p className="text-sm font-semibold">₹{offer.maxDiscount}</p></div>}
            {offer.minOrder > 0 && <div><p className="text-xs text-gray-500">Min Order</p><p className="text-sm font-semibold">₹{offer.minOrder}</p></div>}
            {offer.startDate && <div><p className="text-xs text-gray-500">Start Date</p><p className="text-sm font-semibold">{offer.startDate}</p></div>}
            {offer.endDate && <div><p className="text-xs text-gray-500">End Date</p><p className="text-sm font-semibold">{offer.endDate}</p></div>}
            <div><p className="text-xs text-gray-500">Usage</p><p className="text-sm font-semibold">{offer.usedCount || 0} / {offer.usageLimit || "∞"}</p></div>
            {offer.description && <div className="col-span-2"><p className="text-xs text-gray-500">Description</p><p className="text-sm text-gray-700">{offer.description}</p></div>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Actions</h3>
          <div className="flex gap-3">
            <button onClick={() => offer.status === "active" ? deactivateOffer(offer.id) : activateOffer(offer.id)} className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${offer.status === "active" ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"}`}>
              {offer.status === "active" ? "Deactivate Offer" : "Activate Offer"}
            </button>
            <button onClick={() => { if (window.confirm("Are you sure you want to delete this offer?")) { deleteOffer(offer.id); navigate("/admin/offers"); } }} className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 text-sm font-semibold rounded-md border border-rose-200 hover:bg-rose-100 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
