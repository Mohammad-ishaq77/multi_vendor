import { motion } from "framer-motion";
import { Store, Clock, Star, Truck } from "lucide-react";
import { useShopkeeper } from "../context/ShopkeeperContext";

const ShopStatus = () => {
  const { shop, setShop } = useShopkeeper();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-md border border-gray-100 p-2.5 shadow-sm sm:rounded-lg sm:p-5"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3 className="font-bold text-gray-900 text-[10px] sm:text-sm">Shop Status</h3>
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

      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center gap-2.5 text-sm sm:gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center sm:w-8 sm:h-8 ${shop.isOpen ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"}`}>
            <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 sm:text-xs">Status</p>
            <p className={`text-xs font-semibold sm:text-sm ${shop.isOpen ? "text-emerald-600" : "text-gray-500"}`}>
              {shop.isOpen ? "Shop is Open" : "Shop is Closed"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-sm sm:gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 sm:w-8 sm:h-8">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 sm:text-xs">Hours</p>
            <p className="text-xs font-semibold text-gray-900 sm:text-sm">{shop.openingTime} – {shop.closingTime}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-sm sm:gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 sm:w-8 sm:h-8">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 sm:text-xs">Rating</p>
            <p className="text-xs font-semibold text-gray-900 sm:text-sm">{shop.rating} ({shop.totalReviews} reviews)</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-sm sm:gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 sm:w-8 sm:h-8">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 sm:text-xs">Delivery</p>
            <p className="text-xs font-semibold text-gray-900 sm:text-sm">{shop.deliveryTime} &middot; Min ₹{shop.minOrder}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopStatus;
