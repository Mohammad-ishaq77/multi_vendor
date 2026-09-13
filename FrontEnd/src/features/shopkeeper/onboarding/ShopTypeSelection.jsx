import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBasket, ChevronRight, Plus, Search, CheckCircle2 } from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";
import { shopTypes } from "../data/shopTypes";

const ShopTypeSelection = () => {
  const navigate = useNavigate();
  const { setShop, setOnboardingStep } = useShopkeeper();
  const [selected, setSelected] = useState(null);
  const [customType, setCustomType] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = shopTypes.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (type) => {
    setSelected(type);
    setIsCustom(false);
    setCustomType("");
  };

  const handleCustom = () => {
    setIsCustom(true);
    setSelected(null);
  };

  const handleProceed = () => {
    const typeName = isCustom ? customType.trim() : selected?.name;
    if (!typeName) return;
    setSubmitting(true);
    setTimeout(() => {
      setShop({ type: typeName, typeId: selected?.id || null });
      setOnboardingStep("create_shop");
      navigate("/shopkeeper/onboarding/create-shop");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/25 mx-auto mb-4"
          >
            <ShoppingBasket className="w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Select Your Shop Type</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Choose the category that best describes your business. This helps customers find you easily.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shop types..."
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all shadow-sm"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <AnimatePresence>
            {filtered.map((type, i) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleSelect(type)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                  selected?.id === type.id
                    ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-600/10"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                {selected?.id === type.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </motion.div>
                )}
                <span className="text-3xl">{type.icon}</span>
                <span className="text-xs font-bold text-gray-800 text-center leading-tight">{type.name}</span>
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Create New Type */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filtered.length * 0.03 }}
            onClick={handleCustom}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-all duration-200 ${
              isCustom
                ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-600/10"
                : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isCustom ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
            }`}>
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-600 text-center">Create New Type</span>
          </motion.button>
        </div>

        {/* Custom Type Input */}
        <AnimatePresence>
          {isCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Custom Shop Type
                </label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g. Sports Equipment, Pet Store..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2">Your custom type will be submitted for admin approval.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Proceed */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleProceed}
          disabled={(!selected && !isCustom) || (isCustom && !customType.trim()) || submitting}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ShopTypeSelection;
