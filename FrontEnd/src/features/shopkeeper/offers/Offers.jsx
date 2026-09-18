import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Tag, Trash2, Percent, IndianRupee } from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";

const Offers = () => {
  const navigate = useNavigate();
  const { offers, toggleOfferActive, deleteOffer } = useShopkeeper();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  return (
    <ShopkeeperShell>
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Offers & Discounts</h1>
            <p className="text-xs text-gray-500 mt-0.5">{offers.length} offers created</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/shopkeeper/offers/create")}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Offer
          </motion.button>
        </div>

        {offers.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 sm:py-24">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
              <Tag className="w-11 h-11 text-gray-300" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900">No offers yet</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs text-center">Create offers to attract more customers and boost sales.</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/shopkeeper/offers/create")}
              className="mt-6 inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-md font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-4 h-4" /> Create First Offer
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-lg border p-5 shadow-sm transition-all ${offer.active ? "border-gray-100" : "border-gray-200 opacity-60"}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${offer.type === "percentage" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                      {offer.type === "percentage" ? <Percent className="w-5 h-5" /> : <IndianRupee className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{offer.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${offer.active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                          {offer.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{offer.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{offer.type === "percentage" ? `${offer.value}% off` : `₹${offer.value} off`}</span>
                        <span>Min order: ₹{offer.minOrder}</span>
                        <span>{offer.usedCount}/{offer.usageLimit} used</span>
                        <span>{offer.validFrom} to {offer.validTill}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:pl-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleOfferActive(offer.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                        offer.active ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {offer.active ? "Deactivate" : "Activate"}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(offer)}
                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all border border-gray-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-gray-50">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Usage</span>
                    <span>{Math.round((offer.usedCount / offer.usageLimit) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min((offer.usedCount / offer.usageLimit) * 100, 100)}%` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl">
                <div className="w-12 h-12 rounded-md bg-rose-50 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center">Delete Offer?</h3>
                <p className="text-sm text-gray-500 text-center mt-2">Are you sure you want to delete <span className="font-semibold">{deleteConfirm.title}</span>?</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-md text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">Cancel</button>
                  <button onClick={() => { deleteOffer(deleteConfirm.id); setDeleteConfirm(null); }} className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ShopkeeperShell>
  );
};

export default Offers;
