import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Truck,
  ShieldCheck,
  Clock,
  Package,
  CheckCircle2,
  Minus,
  Plus,
  Phone,
  IndianRupee,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import CustomerShell from "../components/CustomerShell";
import { useCart } from "../context/CartContext";
import { products as allProducts } from "../data/customerData";

// --- Enrich products from shared data with detail-only fields ---

const extraDetails = {
  1: { description: "Crisp, farm-fresh cucumbers packed with hydration and crunch. Perfect for salads, raitas, and detox water. Sourced daily from local organic farms.", reviews: 87, deliveryTime: "30-45 min", inStock: true },
  2: { description: "Premium Basmati rice aged for 12 months. Long grain, aromatic, and non-sticky when cooked. Ideal for biryanis, pulao, and everyday meals.", reviews: 134, deliveryTime: "25-40 min", inStock: true },
  3: { description: "Studio-quality wireless headphones with active noise cancellation, 40-hour battery, and deep bass. Comfortable over-ear design for extended listening.", reviews: 211, deliveryTime: "2-3 days", inStock: true },
  4: { description: "Soothing aloe vera gel for face and body. Hydrates, heals sunburns, and moisturizes without greasiness. 100% pure and chemical-free.", reviews: 98, deliveryTime: "30-45 min", inStock: true },
  5: { description: "Beautiful indoor Monstera deliciosa plant in a designer pot. Air-purifying, low maintenance, and adds a tropical vibe to any room.", reviews: 56, deliveryTime: "30-45 min", inStock: true },
  6: { description: "Rich, creamy Amul butter made from fresh cream. Perfect for spreading on toast, cooking, and adding richness to any dish.", reviews: 178, deliveryTime: "20-35 min", inStock: true },
  7: { description: "Lightweight running shoes with responsive cushioning and breathable mesh upper. Designed for daily runs and marathon training.", reviews: 145, deliveryTime: "2-3 days", inStock: true },
  8: { description: "Refreshing cold-pressed mixed fruit juice blend. No added sugar, no preservatives. Packed with vitamins and natural goodness.", reviews: 63, deliveryTime: "20-35 min", inStock: true },
  9: { description: "Effervescent vitamin C tablets for daily immunity boost. Orange-flavored, dissolves in water instantly. 60 tablets per bottle.", reviews: 89, deliveryTime: "2-3 days", inStock: true },
  10: { description: "Hand-picked premium Assam tea leaves for a bold, malty, and rich flavor. Perfect for a strong morning cuppa. Loose leaf format.", reviews: 72, deliveryTime: "25-40 min", inStock: true },
  11: { description: "Extra virgin olive oil cold-pressed from handpicked olives. Rich in antioxidants, perfect for salads, dressing, and Mediterranean cooking.", reviews: 103, deliveryTime: "20-35 min", inStock: true },
  12: { description: "Freshly ground whole wheat atta made from sharbati grains. Soft rotis with great taste and aroma. Stone-ground to preserve nutrients.", reviews: 156, deliveryTime: "20-35 min", inStock: true },
};

const enrichedProducts = allProducts.map((p) => ({
  ...p,
  reviews: extraDetails[p.id]?.reviews ?? Math.floor(Math.random() * 150) + 20,
  description: extraDetails[p.id]?.description ?? `Premium quality ${p.name.toLowerCase()} from ${p.shop}. Carefully sourced and delivered fresh to your doorstep.`,
  deliveryTime: extraDetails[p.id]?.deliveryTime ?? "30-45 min",
  inStock: extraDetails[p.id]?.inStock ?? true,
  shopPhone: "+91 98765 43210",
  shopAddress: `NearMart Partner Store`,
}));

// --- Product Detail Page ---

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const numericId = Number(id);
  const product = allProducts.find((p) => p.id === numericId);

  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]").includes(numericId);
    } catch {
      return false;
    }
  });
  const [addedToCart, setAddedToCart] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <CustomerShell>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Product not found</h2>
            <p className="text-gray-500 mt-2">The product you are looking for does not exist.</p>
            <button
              onClick={() => navigate("/customer/products")}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </button>
          </div>
        </div>
      </CustomerShell>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const totalPrice = product.price * quantity;

  const toggleWishlist = () => {
    const ids = JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]");
    const next = saved ? ids.filter((itemId) => itemId !== numericId) : [...ids, numericId];
    localStorage.setItem("nearmart_wishlist", JSON.stringify(next));
    window.dispatchEvent(new Event("nearmart-wishlist-change"));
    setSaved(!saved);
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleOrderNow = () => {
    addToCart({ ...product, quantity });
    setShowOrderModal(true);
    setTimeout(() => {
      setShowOrderModal(false);
      navigate("/customer/cart");
    }, 1500);
  };

  const relatedProducts = enrichedProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <CustomerShell>
      <div className="w-full">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to products
            </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left - Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {hasDiscount && (
                  <span className="absolute top-4 left-4 inline-flex items-center rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.badge && !hasDiscount && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    {product.badge}
                  </span>
                )}
                <button
                  onClick={toggleWishlist}
                  className={`absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md border transition-all duration-200 ${
                    saved
                      ? "border-red-100 bg-red-50 text-red-500 shadow-lg"
                      : "border-white/60 bg-white/80 text-gray-400 hover:text-red-400 shadow-lg"
                  }`}
                >
                  <Heart className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-3 mt-4">
                {[product.image, product.image, product.image].map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? "border-emerald-500 ring-2 ring-emerald-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right - Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col"
            >
              {/* Category */}
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <BadgeCheck className="w-3.5 h-3.5" />
                {product.category}
              </span>

              {/* Title */}
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-400">{product.reviews} reviews</span>
                <span className="text-sm text-emerald-600 font-medium">In Stock</span>
              </div>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
                    <span className="text-sm font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                      Save ₹{product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">per {product.unit}</p>

              {/* Description */}
              <p className="mt-5 text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Delivery Info */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2.5 rounded-md bg-white border border-gray-100 p-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Fast Delivery</p>
                    <p className="text-[0.65rem] text-gray-400">{product.deliveryTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-md bg-white border border-gray-100 p-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Quality Assured</p>
                    <p className="text-[0.65rem] text-gray-400">100% Fresh</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-md bg-white border border-gray-100 p-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Same Day</p>
                    <p className="text-[0.65rem] text-gray-400">Order by 6 PM</p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Quantity</label>
                <div className="inline-flex items-center rounded-md border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="ml-3 text-sm text-gray-500">
                  Total: <span className="font-bold text-emerald-700">₹{totalPrice}</span>
                </span>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-bold transition-all duration-200 border-2 ${
                    addedToCart
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span
                        key="added"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Added to Cart
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <button
                  onClick={handleOrderNow}
                  className="flex-[1.5] flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/30 transition-all active:scale-[0.98]"
                >
                  <IndianRupee className="w-4 h-4" />
                  Order Now
                </button>
              </div>

              {/* Shop Info */}
              <div className="mt-6 rounded-md bg-white border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700 text-lg font-bold shrink-0">
                    {product.shop.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{product.shop}</h3>
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {product.shopAddress}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {product.shopPhone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-12 sm:mt-16"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">More from {product.category}</h2>
                <Link
                  to={`/customer/products?category=${product.category}`}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View all <ArrowLeft className="w-3 h-3 rotate-180" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/customer/product/${p.id}`}
                    className="group block rounded-lg bg-white border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-600/70">
                        {p.category}
                      </span>
                      <h3 className="mt-1 text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {p.name}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-700">₹{p.price}</span>
                        <span className="flex items-center gap-1 text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {p.rating}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

        {/* Order Success Modal */}
        <AnimatePresence>
          {showOrderModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900">Added to Cart!</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {product.name} × {quantity} added. Redirecting to cart...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CustomerShell>
  );
};

export default ProductDetail;