import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Package, Trash2 } from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import ProductCard from "../components/ProductCard";
import { useShopkeeper } from "../context/ShopkeeperContext";

const categories = ["All", "Vegetables", "Fruits", "Dairy", "Bakery", "Grocery", "Snacks"];

const Products = () => {
  const navigate = useNavigate();
  const { products, deleteProduct, updateProduct } = useShopkeeper();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = products.filter((p) => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (product) => {
    setDeleteConfirm(product);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteProduct(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleToggleAvailability = (id) => {
    const p = products.find((x) => x.id === id);
    if (p) updateProduct(id, { available: !p.available });
  };

  return (
    <ShopkeeperShell>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
            <p className="text-xs text-gray-500 mt-0.5">{products.length} products in your shop</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/shopkeeper/products/add")}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </motion.button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1 overflow-x-auto pb-3 mb-5 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 sm:py-24">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
              <Package className="w-11 h-11 text-gray-300" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900">No products found</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs text-center">
              {searchQuery ? "Try adjusting your search." : "Start adding products to your shop."}
            </p>
            {!searchQuery && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/shopkeeper/products/add")}
                className="mt-6 inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-4 h-4" /> Add First Product
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onEdit={(p) => navigate(`/shopkeeper/products/${p.id}/edit`)}
                  onDelete={handleDelete}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center">Delete Product?</h3>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Are you sure you want to delete <span className="font-semibold">{deleteConfirm.name}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ShopkeeperShell>
  );
};

export default Products;
