import { motion } from "framer-motion";
import { Store, Clock, Star, Truck } from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";

const ShopStatus = () => {
  const { shop, setShop } = useShopkeeper();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 text-sm">Shop Status</h3>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShop({ isOpen: !shop.isOpen })}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            shop.isOpen ? "bg-emerald-500" : "bg-gray-300"
          }`}
        >
          <motion.div
            animate={{ x: shop.isOpen ? 24 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
          />
        </motion.button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${shop.isOpen ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"}`}>
            <Store className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className={`text-sm font-semibold ${shop.isOpen ? "text-emerald-600" : "text-gray-500"}`}>
              {shop.isOpen ? "Shop is Open" : "Shop is Closed"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Hours</p>
            <p className="text-sm font-semibold text-gray-900">{shop.openingTime} – {shop.closingTime}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Star className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Rating</p>
            <p className="text-sm font-semibold text-gray-900">{shop.rating} ({shop.totalReviews} reviews)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Delivery</p>
            <p className="text-sm font-semibold text-gray-900">{shop.deliveryTime} &middot; Min ₹{shop.minOrder}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopStatus;
