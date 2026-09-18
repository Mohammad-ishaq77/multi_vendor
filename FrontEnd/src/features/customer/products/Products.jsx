import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Star,
  Heart,
  ShoppingCart,
  CheckCircle2,
  MapPin,
  SlidersHorizontal,
  ArrowRight,
  Package,
  Filter,
  ChevronDown,
  IndianRupee,
} from "lucide-react";
import CustomerShell from "../components/CustomerShell";
import { products, shops } from "../data/customerData";
import { useCart } from "../context/CartContext";

// --- Helpers ---

const getSavedAddress = () => {
  try {
    const addresses = JSON.parse(localStorage.getItem("nearmart_addresses") || "[]");
    const index = Number(localStorage.getItem("nearmart_default_address"));
    return addresses[Number.isInteger(index) ? index : 0];
  } catch {
    return null;
  }
};

// --- 10 Products with Images ---

const featuredProducts = [
  {
    id: "p1",
    name: "Fresh Organic Tomatoes",
    category: "Vegetables",
    shop: "Green Valley Farms",
    price: 45,
    originalPrice: 60,
    unit: "1 kg",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=400&fit=crop",
    rating: 4.8,
    badge: "Bestseller",
    description: "Farm-fresh organic tomatoes, hand-picked daily. Rich in flavor and perfect for salads, curries, and sauces.",
    inStock: true,
  },
  {
    id: "p2",
    name: "Alphonso Mangoes",
    category: "Fruits",
    shop: "Mango King",
    price: 350,
    originalPrice: 450,
    unit: "1 dozen",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&h=400&fit=crop",
    rating: 4.9,
    badge: "Seasonal",
    description: "Premium Ratnagiri Alphonso mangoes. Sweet, aromatic, and absolutely delicious. Limited seasonal stock.",
    inStock: true,
  },
  {
    id: "p3",
    name: "Whole Wheat Bread",
    category: "Bakery",
    shop: "Daily Bakes",
    price: 55,
    originalPrice: null,
    unit: "400g loaf",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=400&fit=crop",
    rating: 4.5,
    badge: null,
    description: "Soft, freshly baked whole wheat bread with no preservatives. Perfect for sandwiches and toast.",
    inStock: true,
  },
  {
    id: "p4",
    name: "Fresh Milk",
    category: "Dairy",
    shop: "Dairy Fresh",
    price: 68,
    originalPrice: 75,
    unit: "1 litre",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&h=400&fit=crop",
    rating: 4.7,
    badge: "Daily Essential",
    description: "Pure farm-fresh cow milk, pasteurized and packed with care. Rich in calcium and protein.",
    inStock: true,
  },
  {
    id: "p5",
    name: "Red Apples",
    category: "Fruits",
    shop: "Fruit Basket",
    price: 120,
    originalPrice: 150,
    unit: "1 kg",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&h=400&fit=crop",
    rating: 4.6,
    badge: null,
    description: "Crisp and juicy red apples sourced from Kashmir. Great for snacking, juices, and pies.",
    inStock: true,
  },
  {
    id: "p6",
    name: "Brown Eggs",
    category: "Dairy",
    shop: "Dairy Fresh",
    price: 90,
    originalPrice: 110,
    unit: "6 pcs",
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=400&fit=crop",
    rating: 4.4,
    badge: "Protein Rich",
    description: "Farm-fresh brown eggs from free-range chickens. High in protein and essential nutrients.",
    inStock: true,
  },
  {
    id: "p7",
    name: "Fresh Spinach",
    category: "Vegetables",
    shop: "Green Valley Farms",
    price: 30,
    originalPrice: null,
    unit: "500g bunch",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&h=400&fit=crop",
    rating: 4.3,
    badge: null,
    description: "Organic spinach leaves, washed and ready to cook. Packed with iron and vitamins.",
    inStock: true,
  },
  {
    id: "p8",
    name: "Butter Croissants",
    category: "Bakery",
    shop: "Daily Bakes",
    price: 85,
    originalPrice: 100,
    unit: "3 pcs",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=400&fit=crop",
    rating: 4.8,
    badge: "Freshly Baked",
    description: "Flaky, buttery croissants baked fresh every morning. Perfect with coffee or tea.",
    inStock: true,
  },
  {
    id: "p9",
    name: "Bananas",
    category: "Fruits",
    shop: "Fruit Basket",
    price: 40,
    originalPrice: 50,
    unit: "1 dozen",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=400&fit=crop",
    rating: 4.5,
    badge: null,
    description: "Sweet and ripe bananas, perfect for smoothies, cereal, or a quick healthy snack.",
    inStock: true,
  },
  {
    id: "p10",
    name: "Paneer",
    category: "Dairy",
    shop: "Dairy Fresh",
    price: 140,
    originalPrice: 160,
    unit: "250g",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=400&fit=crop",
    rating: 4.7,
    badge: "Homemade",
    description: "Fresh homemade paneer, soft and creamy. Ideal for curries, tikka, and snacks.",
    inStock: true,
  },
];

// --- Product Card ---

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const shop = shops.find((s) => s.name === product.shop);

  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]").includes(product.id);
    } catch {
      return false;
    }
  });
  const [added, setAdded] = useState(false);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ids = JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]");
    const next = saved ? ids.filter((id) => id !== product.id) : [...ids, product.id];
    localStorage.setItem("nearmart_wishlist", JSON.stringify(next));
    window.dispatchEvent(new Event("nearmart-wishlist-change"));
    setSaved(!saved);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
      className="group"
    >
      <Link to={`/customer/product/${product.id}`} className="block">
        <div className="relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 h-full">
          {/* Image */}
          <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {hasDiscount && (
                <span className="inline-flex items-center rounded-lg bg-rose-500 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
              {product.badge && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={toggleWishlist}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border transition-all duration-200 z-10 ${
                saved
                  ? "border-red-100 bg-red-50 text-red-500 shadow-sm"
                  : "border-white/60 bg-white/80 text-gray-400 hover:text-red-400 shadow-sm"
              }`}
            >
              <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
            </button>

            {/* Quick add */}
            <button
              onClick={handleAddToCart}
              className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-200 z-10 ${
                added
                  ? "bg-emerald-500 text-white shadow-emerald-500/30"
                  : "bg-white/90 backdrop-blur-md text-emerald-600 border border-white/60 hover:bg-emerald-600 hover:text-white"
              }`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="cart"
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4">
            <div className="flex-1">
              {/* Category */}
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-emerald-600/70">
                {product.category}
              </span>

              {/* Name */}
              <h3 className="mt-1 text-[0.9rem] font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                {product.name}
              </h3>

              {/* Shop & Rating */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">{product.shop}</span>
                {shop?.rating && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {shop.rating}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-gray-400">{product.unit}</p>
            </div>

            {/* Price */}
            <div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-emerald-700">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                View <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// --- Empty State ---

const EmptyState = ({ onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5">
      <Package className="w-9 h-9 text-gray-300" />
    </div>
    <h3 className="text-lg font-bold text-gray-900">No products found</h3>
    <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
      Try adjusting your filters or search for something different.
    </p>
    <button
      onClick={onClear}
      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
    >
      <X className="w-4 h-4" />
      Clear filters
    </button>
  </motion.div>
);

// --- Sidebar Section ---

const SidebarSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
      <Filter className="w-3 h-3" />
      {title}
    </h3>
    {children}
  </div>
);

// --- Main Page ---

const Products = () => {
  const [params, setParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const search = (params.get("search") || "").toLowerCase();
  const category = params.get("category");
  const sort = params.get("sort") || "";

  const savedAddress = useMemo(() => getSavedAddress(), []);

  const categories = useMemo(() => {
    const cats = [...new Set(featuredProducts.map((p) => p.category).filter(Boolean))];
    return cats;
  }, []);

  const visible = useMemo(() => {
    let result = featuredProducts.filter((product) => {
      const matchesSearch = !search || `${product.name} ${product.shop} ${product.category}`.toLowerCase().includes(search);
      const matchesCategory = !category || product.category?.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCategory;
    });

    const sorted = [...result];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating-desc") sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [search, category, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const clearFilters = () => setParams({});

  const activeFilterCount = [search, category, sort].filter(Boolean).length;

  return (
    <CustomerShell>
      <div className="w-full">
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex-1">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => updateParam("search", e.target.value)}
                    placeholder="Search products, shops..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-50"
                  />
                  {search && (
                    <button
                      onClick={() => updateParam("search", "")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[0.6rem] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

        {/* Mobile Filters */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden bg-white border border-gray-100 rounded-2xl mb-4"
            >
              <div className="px-4 py-4 space-y-4">
                {/* Sort */}
                <div>
                  <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                    Sort by
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => updateParam("sort", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-emerald-400"
                  >
                    <option value="">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Top Rated</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                </div>
                {/* Categories */}
                <div>
                  <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateParam("category", "")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        !category
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateParam("category", category?.toLowerCase() === cat.toLowerCase() ? "" : cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                          category?.toLowerCase() === cat.toLowerCase()
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-emerald-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-4 space-y-2">
                {/* Sort */}
                <SidebarSection title="Sort By">
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {[
                      { value: "", label: "Featured", icon: Star },
                      { value: "price-asc", label: "Price: Low to High", icon: IndianRupee },
                      { value: "price-desc", label: "Price: High to Low", icon: IndianRupee },
                      { value: "rating-desc", label: "Top Rated", icon: Star },
                      { value: "name-asc", label: "Name: A to Z", icon: Filter },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateParam("sort", opt.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                          sort === opt.value
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                        {sort === opt.value && (
                          <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </SidebarSection>

                {/* Categories */}
                <SidebarSection title="Categories">
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => updateParam("category", "")}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 ${
                        !category
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      All Products
                      {!category && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-600" />}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateParam("category", category?.toLowerCase() === cat.toLowerCase() ? "" : cat)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                          category?.toLowerCase() === cat.toLowerCase()
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[0.6rem] font-bold">
                          {cat[0]}
                        </span>
                        {cat}
                        {category?.toLowerCase() === cat.toLowerCase() && (
                          <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </SidebarSection>

                {/* Price Range Info */}
                <SidebarSection title="Price Range">
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Min: ₹{Math.min(...featuredProducts.map(p => p.price))}</span>
                      <span>Max: ₹{Math.max(...featuredProducts.map(p => p.price))}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">All prices in INR</p>
                  </div>
                </SidebarSection>

                {/* Delivery Info */}
                {savedAddress && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Delivering to</span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-800">{savedAddress.city}</p>
                    <p className="text-xs text-emerald-600/70 mt-1">Local delivery available</p>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {category ? category : "All Products"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {visible.length} product{visible.length !== 1 ? "s" : ""} found
                  </p>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* Mobile Category Pills */}
              <div className="lg:hidden mb-5 -mx-4 px-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                    onClick={() => updateParam("category", "")}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      !category
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateParam("category", category?.toLowerCase() === cat.toLowerCase() ? "" : cat)}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        category?.toLowerCase() === cat.toLowerCase()
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid - Uniform Cards */}
              {visible.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState onClear={clearFilters} />
              )}
            </main>
          </div>
        </div>
      </div>
    </CustomerShell>
  );
};

export default Products;