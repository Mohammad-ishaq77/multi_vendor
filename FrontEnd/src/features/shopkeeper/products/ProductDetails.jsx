import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Edit3, Package, Tag, IndianRupee, Box } from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import { useShopkeeper } from "../context/ShopkeeperContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useShopkeeper();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <ShopkeeperShell>
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Product not found.</p>
          <button onClick={() => navigate("/shopkeeper/products")} className="mt-4 text-emerald-600 font-semibold text-sm hover:underline">Back to Products</button>
        </div>
      </ShopkeeperShell>
    );
  }

  return (
    <ShopkeeperShell>
      <div className="w-full">
        <button onClick={() => navigate("/shopkeeper/products")} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Product Details</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/shopkeeper/products/${id}/edit`)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" /> Edit
          </motion.button>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Image */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
            ) : (
              <div className="w-full h-64 bg-gray-50 flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${product.available ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-500"}`}>
                  {product.available ? "In Stock" : "Out of Stock"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold bg-blue-50 text-blue-600">{product.category}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{product.description}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Price</span>
                  <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                </div>
                {product.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Discount</span>
                    <span className="text-sm font-bold text-rose-600">{product.discount}% OFF</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1.5"><Box className="w-3.5 h-3.5" /> Stock</span>
                  <span className={`text-sm font-bold ${product.stock > 10 ? "text-emerald-600" : product.stock > 0 ? "text-amber-600" : "text-rose-600"}`}>
                    {product.stock} {product.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Unit</span>
                  <span className="text-sm font-bold text-gray-900">{product.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Added</span>
                  <span className="text-sm font-bold text-gray-900">{product.createdAt}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ShopkeeperShell>
  );
};

export default ProductDetails;
