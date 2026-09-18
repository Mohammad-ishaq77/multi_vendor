import React from "react";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, ArrowRight, Store } from "lucide-react";
import CardImage from "../../../components/common/CardImage";

const ShopCard = ({ shop, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      onClick={onClick}
      className="group bg-white rounded-md border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[#155c43]/5 hover:border-[#155c43]/10 transition-all duration-300 cursor-pointer sm:rounded-lg"
    >
      {/* Shop Image */}
      <div className="relative h-28 bg-gradient-to-br from-[#edf4f0] to-[#dff1e7] overflow-hidden sm:h-44">
        {shop.image ? (
          <CardImage
            src={shop.image}
            alt={shop.name}
            category={shop.category}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#155c43]/20">
            <Store className="w-10 h-10 sm:w-16 sm:h-16" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:rounded-lg sm:gap-1"
        >
          <Star className="w-3 h-3 text-[var(--color-green-light)] fill-[var(--color-green-light)] sm:w-3.5 sm:h-3.5" />
          <span className="text-[10px] font-bold text-[#14261f] sm:text-xs">{shop.rating}</span>
          <span className="text-[0.55rem] text-gray-400 hidden sm:inline">({shop.reviewCount || 120})</span>
        </motion.div>

        {/* Open Badge */}
        <div className="absolute top-2 right-2 bg-[#155c43] text-white text-[0.55rem] font-bold px-1.5 py-0.5 rounded-md shadow-lg shadow-[#155c43]/20 sm:top-3 sm:right-3 sm:text-[0.65rem] sm:px-2.5 sm:py-1 sm:rounded-lg">
          Open
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-5">
        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xs text-[#14261f] group-hover:text-[#155c43] transition-colors truncate sm:text-base">
              {shop.name}
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5 font-medium sm:text-xs">{shop.category}</p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            whileHover={{ x: 3 }}
            className="hidden sm:flex w-8 h-8 rounded-full bg-[#f5f7f6] items-center justify-center text-gray-400 group-hover:bg-[#155c43] group-hover:text-white transition-all duration-300 flex-shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 sm:gap-4 sm:mt-4 sm:text-xs">
          <span className="flex items-center gap-0.5 sm:gap-1">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {shop.deliveryTime}
          </span>
          <span className="flex items-center gap-0.5 truncate sm:gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
            <span className="truncate">{shop.location}</span>
          </span>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.(event);
          }}
          className="w-full mt-2 bg-[#155c43] text-white py-1.5 rounded-lg font-semibold text-[10px] hover:bg-[#104b36] transition-colors shadow-md shadow-[#155c43]/15 flex items-center justify-center gap-1 group/btn sm:mt-4 sm:py-2.5 sm:rounded-md sm:text-sm sm:gap-2"
        >
          View Shop
          <motion.span
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ShopCard;