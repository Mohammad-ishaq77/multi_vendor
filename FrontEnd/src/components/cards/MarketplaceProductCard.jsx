import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../features/customer/context/CartContext";
import { useToast } from "../common/Toast";
import CardImage from "../common/CardImage";

const MarketplaceProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const href = isAuthenticated && user?.role === "customer" ? `/customer/product/${product.id}` : "/login";

  const handleAdd = (event) => {
    event.preventDefault();
    if (isAuthenticated && user?.role === "customer") {
      addToCart(product);
      showToast(`${product.name} added to cart`);
      return;
    }
    navigate("/login");
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      className="card-surface card-shine group flex h-full flex-col overflow-hidden"
    >
      <Link to={href} className="block">
        <div className="card-media relative h-40 overflow-hidden sm:h-48">
          <CardImage src={product.image} alt={product.name} category={product.category} className="h-full w-full object-cover" />
          {product.badge && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-(--color-primary) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {product.badge}
            </span>
          )}
          {product.rating && (
            <span className="absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-(--color-primary-dark)">
              <Star className="h-3 w-3 fill-current text-(--color-primary)" />
              {product.rating}
            </span>
          )}
        </div>
        <div className="px-3 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-(--color-primary)">
            {product.shop || product.category}
          </p>
          <h3 className="mt-1 line-clamp-1 text-sm font-bold text-(--color-text) group-hover:text-(--color-primary)">
            {product.name}
          </h3>
          {product.unit && <p className="mt-0.5 text-[11px] text-(--color-text-muted)">{product.unit}</p>}
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-base font-bold text-(--color-primary-dark)">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-[11px] text-(--color-text-muted) line-through">₹{product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>
      <button type="button" onClick={handleAdd} className="btn-primary mx-3 mb-3 mt-auto min-h-9 text-xs">
        <ShoppingCart className="h-3.5 w-3.5" />
        Add to cart
      </button>
    </motion.article>
  );
};

export default MarketplaceProductCard;
