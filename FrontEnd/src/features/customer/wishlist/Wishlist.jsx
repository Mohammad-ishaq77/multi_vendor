import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CustomerShell from "../components/CustomerShell";
import ProductCard from "../components/ProductCard";
import { products } from "../data/customerData";
import { useCart } from "../context/CartContext";

const Wishlist = () => {
  const [ids, setIds] = useState(() =>
    JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]")
  );
  const { addToCart } = useCart();

  useEffect(() => {
    localStorage.setItem("nearmart_wishlist", JSON.stringify(ids));
  }, [ids]);

  useEffect(() => {
    const refresh = () => setIds(JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]"));
    window.addEventListener("nearmart-wishlist-change", refresh);
    return () => window.removeEventListener("nearmart-wishlist-change", refresh);
  }, []);

  const saved = products.filter((product) => ids.includes(product.id));

  const removeFromWishlist = (productId) => {
    setIds(ids.filter((id) => id !== productId));
    window.dispatchEvent(new Event("nearmart-wishlist-change"));
  };

  const moveAllToCart = () => {
    saved.forEach((product) => addToCart(product));
    setIds([]);
    window.dispatchEvent(new Event("nearmart-wishlist-change"));
  };

  return (
    <CustomerShell>
      <div className="w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2">
              My Wishlist
            </h1>
            <p className="text-[#64748B]">
              {saved.length > 0
                ? `${saved.length} product${saved.length > 1 ? "s" : ""} saved`
                : "Products you want to remember."}
            </p>
          </div>

          {saved.length > 0 && (
            <button
              onClick={moveAllToCart}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] text-white text-sm font-semibold rounded-md hover:bg-[#143728] transition-colors self-start"
            >
              <ShoppingBag className="w-4 h-4" />
              Move All to Cart
            </button>
          )}
        </motion.div>

        {saved.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {saved.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <ProductCard product={product} onAddToCart={addToCart} />
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-gray-100 rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart className="w-9 h-9 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-sm text-[#64748B] mb-6 max-w-xs mx-auto">
              Save products you love and shop them later. Start exploring now!
            </p>
            <Link
              to="/customer/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4332] text-white text-sm font-semibold rounded-md hover:bg-[#143728] transition-colors"
            >
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </CustomerShell>
  );
};

export default Wishlist;