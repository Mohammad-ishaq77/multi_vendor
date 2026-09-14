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
      className="group bg-white rounded-2xl border border-gray-100 p-3.5 hover:shadow-xl hover:shadow-[#155c43]/5 hover:border-[#155c43]/10 transition-all duration-300"
    >
      {/* Image Container — Clickable */}
      <div
        onClick={goToDetail}
        className="relative h-44 bg-[#f5f7f6] rounded-xl overflow-hidden cursor-pointer"
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
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${
            saved
              ? "bg-[var(--color-green-bg)] border-[var(--color-green-soft)] text-[var(--color-primary)]"
              : "bg-white/80 border-white/50 text-gray-400 hover:text-[var(--color-primary)]"
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
      <div onClick={goToDetail} className="mt-3.5 px-0.5 cursor-pointer">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[0.65rem] font-medium text-[#155c43] bg-[#155c43]/8 px-2 py-0.5 rounded-md uppercase tracking-wide">
            {product.category}
          </span>
          {product.rating && (
            <span className="flex items-center gap-0.5 text-[0.65rem] text-[var(--color-primary)] font-medium">
              <Star className="w-3 h-3 fill-[var(--color-green-light)] text-[var(--color-green-light)]" />
              {product.rating}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-sm text-[#14261f] leading-snug line-clamp-1 group-hover:text-[#155c43] transition-colors">
          {product.name}
        </h3>

        <p className="text-xs text-gray-400 mt-0.5">{product.unit}</p>

        {/* Shop Name — Prominent Display */}
        <div className="mt-2 mb-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#155c43]/8 to-[#155c43]/5 rounded-lg border border-[#155c43]/10">
          <span className="text-[11px] font-bold text-[#155c43] uppercase tracking-wide">{product.shop}</span>
        </div>

        <div className="flex items-end justify-between mt-3 gap-2">
          <div>
            <p className="font-bold text-[#155c43] text-lg">₹{product.price}</p>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">₹{product.originalPrice}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-3.5 px-0.5">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all duration-300 overflow-hidden ${
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