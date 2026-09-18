import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin, Heart, Store } from "lucide-react";
import CustomerShell from "../components/CustomerShell";
import ProductCard from "../components/ProductCard";
import { shops, products } from "../data/customerData";
import { useCart } from "../context/CartContext";

const ShopDetails = () => {
  const { shopId } = useParams();
  const { addToCart } = useCart();
  const shop = shops.find((item) => String(item.id) === shopId);
  const shopProducts = products.filter((item) => item.shop === shop?.name);
  const [isFavorite, setIsFavorite] = useState(() =>
    JSON.parse(localStorage.getItem("nearmart_favorite_shops") || "[]").includes(Number(shopId))
  );
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("nearmart_favorite_shops") || "[]");
    const next = isFavorite ? favorites.filter((id) => id !== Number(shopId)) : [...favorites, Number(shopId)];
    localStorage.setItem("nearmart_favorite_shops", JSON.stringify(next));
    setIsFavorite(!isFavorite);
  };

  if (!shop) {
    return (
      <CustomerShell>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">
            Shop Not Found
          </h2>
          <Link
            to="/customer/shops"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] text-white text-sm font-semibold rounded-md hover:bg-[#143728] transition-colors mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Shops
          </Link>
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      <div className="w-full">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/customer/shops"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1B4332] hover:text-[#143728] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            All Shops
          </Link>
        </motion.div>

        {/* Shop Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Shop Image */}
            <div className="w-full sm:w-40 h-40 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Store className="w-14 h-14 text-[#1B4332]/30" />
            </div>

            {/* Shop Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                <div>
                  <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-wider text-[#1B4332] bg-[#1B4332]/10 rounded-full uppercase mb-2">
                    {shop.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                    {shop.name}
                  </h1>
                </div>
                <button onClick={toggleFavorite} aria-label={isFavorite ? "Remove shop from favorites" : "Save shop to favorites"} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all self-start ${isFavorite ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"}`}>
                  <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B] mb-4">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-[#0F172A]">
                    {shop.rating}
                  </span>
                  <span>({shop.reviews || "200+"} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {shop.deliveryTime || "20-30 mins"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Within 2 km
                </span>
              </div>

              <p className="text-sm text-[#64748B] leading-relaxed max-w-lg">
                Discover the best {shop.category.toLowerCase()} products from{" "}
                {shop.name}. Fresh stock, great prices, and fast delivery from
                your neighborhood.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0F172A]">
              Products from {shop.name}
            </h2>
            <span className="text-sm text-[#64748B]">
              {shopProducts.length} items
            </span>
          </div>

          {shopProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {shopProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} onAddToCart={addToCart} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
              <p className="text-[#64748B]">
                No products listed for this shop yet.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </CustomerShell>
  );
};

export default ShopDetails;