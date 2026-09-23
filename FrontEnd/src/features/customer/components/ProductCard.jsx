import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ShoppingCart, Check } from "lucide-react";
import CardImage from "../../../components/common/CardImage";

const ProductCard = ({ product, onAddToCart, redirectToCartOnAdd = false }) => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() =>
    JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]").includes(product.id)
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [added, setAdded] = useState(false);

  const toggleWishlist = (e) => {
    e.stopPropagation();
    const ids = JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]");
    const next = saved ? ids.filter((id) => id !== product.id) : [...ids, product.id];
    localStorage.setItem("nearmart_wishlist", JSON.stringify(next));
    window.dispatchEvent(new Event("nearmart-wishlist-change"));
    setSaved(!saved);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
    setAdded(true);

    if (redirectToCartOnAdd) {
      navigate("/customer/cart");
    }

    setTimeout(() => setAdded(false), 1500);
  };

  const goToDetail = () => {
    navigate(`/customer/product/${product.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="group bg-white rounded-md border border-gray-100 p-2 hover:shadow-xl hover:shadow-[#155c43]/5 hover:border-[#155c43]/10 transition-all duration-300 sm:rounded-lg sm:p-3.5"
    >
      {/* Image Container — Clickable */}
      <div
        onClick={goToDetail}
        className="relative h-28 bg-[#f5f7f6] rounded-lg overflow-hidden cursor-pointer sm:h-44 sm:rounded-md"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <CardImage
          src={product.image}
          alt={product.name}
          category={product.category}
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={toggleWishlist}
          className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 sm:top-2.5 sm:right-2.5 sm:w-9 sm:h-9 ${
            saved
              ? "bg-(--color-green-bg) border-(--color-green-soft) text-(--color-primary)"
              : "bg-white/80 border-white/50 text-gray-400 hover:text-(--color-primary)"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={saved ? "saved" : "unsaved"}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Heart className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Discount Badge */}
        {product.discount && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-2.5 left-2.5 bg-[#155c43] text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-[#155c43]/20"
          >
            {product.discount}% OFF
          </motion.div>
        )}
      </div>

      {/* Details — Clickable */}
      <div onClick={goToDetail} className="mt-2 px-0.5 cursor-pointer sm:mt-3.5">
        <div className="flex items-center gap-1 mb-1 sm:gap-1.5 sm:mb-1.5">
          <span className="text-[0.55rem] font-medium text-[#155c43] bg-[#155c43]/8 px-1.5 py-0.5 rounded uppercase tracking-wide sm:text-[0.65rem] sm:px-2 sm:rounded-md">
            {product.category}
          </span>
          {product.rating && (
            <span className="flex items-center gap-0.5 text-[0.55rem] text-(--color-primary) font-medium sm:text-[0.65rem]">
              <Star className="w-2.5 h-2.5 fill-(--color-green-light) text-(--color-green-light) sm:w-3 sm:h-3" />
              {product.rating}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-xs text-[#14261f] leading-snug line-clamp-1 group-hover:text-[#155c43] transition-colors sm:text-sm">
          {product.name}
        </h3>

        <p className="text-[10px] text-gray-400 mt-0.5 sm:text-xs">{product.unit}</p>

        {/* Shop Name — Prominent Display */}
        <div className="mt-1.5 mb-1.5 inline-flex items-center gap-1 px-1.5 py-1 bg-linear-to-r from-[#155c43]/8 to-[#155c43]/5 rounded-md border border-[#155c43]/10 sm:mt-2 sm:mb-3 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:rounded-lg">
          <span className="text-[9px] font-bold text-[#155c43] uppercase tracking-wide sm:text-[11px]">{product.shop}</span>
        </div>

        <div className="flex items-end justify-between mt-1.5 gap-1 sm:mt-3 sm:gap-2">
          <div>
            <p className="font-bold text-[#155c43] text-sm sm:text-lg">₹{product.price}</p>
            {product.originalPrice && (
              <p className="text-[10px] text-gray-400 line-through sm:text-xs">₹{product.originalPrice}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-2 px-0.5 sm:mt-3.5">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg font-semibold text-[10px] transition-all duration-300 overflow-hidden sm:gap-1.5 sm:px-3 sm:py-2.5 sm:rounded-md sm:text-xs ${
            added
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-[#155c43] text-white shadow-lg shadow-[#155c43]/25 hover:bg-[#104b36] hover:shadow-xl hover:shadow-[#155c43]/30"
          }`}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Added
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;