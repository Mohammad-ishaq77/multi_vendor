import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Edit3, Trash2, Eye, EyeOff, Package } from "lucide-react";
import CardImage from "../../../components/common/CardImage";

const ProductCard = ({ product, index = 0, onEdit, onDelete, onToggleAvailability }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.04, 0.15) }}
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-200/80 transition-all duration-300 ${
        !product.available ? "opacity-60" : ""
      }`}
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-50 overflow-hidden">
        {product.image ? (
          <CardImage src={product.image} alt={product.name} category={product.category} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
        )}
        {product.discount > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full">
            {product.discount}% OFF
          </div>
        )}
        <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${
          product.available ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"
        }`}>
          {product.available ? "In Stock" : "Out of Stock"}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{product.category} &middot; {product.unit}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{product.description}</p>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          {product.discount > 0 && (
            <span className="text-xs text-gray-400 line-through">₹{Math.round(product.price / (1 - product.discount / 100))}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-rose-500"}`} />
          <span className="text-xs text-gray-500">
            {product.stock > 10 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock"} &middot; {product.stock} {product.unit}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/shopkeeper/products/${product.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
          >
            View
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit?.(product)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100"
          >
            <Edit3 className="w-3 h-3" /> Edit
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleAvailability?.(product.id)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100"
            title={product.available ? "Mark unavailable" : "Mark available"}
          >
            {product.available ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete?.(product)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-gray-100"
            title="Delete product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
