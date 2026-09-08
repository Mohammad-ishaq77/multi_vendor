import React from "react";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, ArrowRight, Store } from "lucide-react";

const ShopCard = ({ shop, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[#155c43]/5 hover:border-[#155c43]/10 transition-all duration-300 cursor-pointer"
    >
      {/* Shop Image */}
      <div className="relative h-44 bg-gradient-to-br from-[#edf4f0] to-[#dff1e7] overflow-hidden">
        {shop.image ? (
          <motion.img
            src={shop.image}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#155c43]/20">
            <Store className="w-16 h-16" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm"
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-[#14261f]">{shop.rating}</span>
          <span className="text-[0.65rem] text-gray-400">({shop.reviewCount || 120})</span>
        </motion.div>

        {/* Open Badge */}
        <div className="absolute top-3 right-3 bg-[#155c43] text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-[#155c43]/20">
          Open
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-[#14261f] group-hover:text-[#155c43] transition-colors truncate">
              {shop.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{shop.category}</p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            whileHover={{ x: 3 }}
            className="w-8 h-8 rounded-full bg-[#f5f7f6] flex items-center justify-center text-gray-400 group-hover:bg-[#155c43] group-hover:text-white transition-all duration-300 flex-shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {shop.deliveryTime}
          </span>
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
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
          className="w-full mt-4 bg-[#155c43] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#104b36] transition-colors shadow-md shadow-[#155c43]/15 flex items-center justify-center gap-2 group/btn"
        >
          View Shop
          <motion.span
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ShopCard;