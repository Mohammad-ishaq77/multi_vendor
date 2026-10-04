import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Minus, Package, Plus, ShoppingCart, Store } from "lucide-react";
import { productService } from "../../../services/catalogService";
import { normalizeProduct } from "../../../utils/normalize";
import { useAsyncData } from "../../../hooks/useAsyncData";
import CustomerShell from "../components/CustomerShell";
import CardImage from "../../../components/common/CardImage";
import ProductRecommendations from "../../../components/products/ProductRecommendations";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]").includes(id);
    } catch {
      return false;
    }
  });
  const [cartError, setCartError] = useState("");
  const [adding, setAdding] = useState(false);
  const state = useAsyncData(
    () => productService.get(id).then(normalizeProduct),
    [id],
    { enabled: Boolean(id) }
  );
  const product = state.data;

  const toggleWishlist = () => {
    let ids = [];
    try {
      ids = JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]");
    } catch {
      ids = [];
    }
    const next = saved ? ids.filter((productId) => productId !== id) : [...ids, id];
    localStorage.setItem("nearmart_wishlist", JSON.stringify(next));
    window.dispatchEvent(new Event("nearmart-wishlist-change"));
    setSaved(!saved);
  };

  const handleAddToCart = async (goToCart = false) => {
    setAdding(true);
    setCartError("");
    const result = await addToCart(product, quantity);
    setAdding(false);
    if (!result.ok) {
      setCartError(result.error);
      return;
    }
    if (goToCart) navigate("/customer/cart");
  };

  return (
    <CustomerShell>
      <section className="mx-auto w-full max-w-6xl">
        <Link to="/customer/products" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>

        {state.loading ? (
          <p className="py-16 text-center text-sm text-gray-500">Loading product...</p>
        ) : state.error ? (
          <div role="alert" className="py-16 text-center text-sm text-rose-700">
            <p>Product could not be loaded. {state.error}</p>
            <button type="button" onClick={state.reload} className="mt-3 font-semibold underline">Retry</button>
          </div>
        ) : !product ? (
          <div className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">Product not found</h1>
            <p className="mt-2 text-sm text-gray-500">This product may have been removed or is no longer available.</p>
          </div>
        ) : (
          <div className="grid gap-8 rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-8 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
              <CardImage src={product.image} alt={product.name} category={product.category} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={toggleWishlist}
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute right-3 top-3 rounded-full bg-white p-3 shadow ${saved ? "text-rose-600" : "text-gray-500"}`}
              >
                <Heart className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="flex flex-col">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{product.category || "Product"}</p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-emerald-800">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                )}
                <span className="text-sm text-gray-500">/ {product.unit || "item"}</span>
              </div>
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {product.description || "No description provided by the shop."}
              </p>
              <p className={`mt-4 text-sm font-medium ${product.stock > 0 && product.available ? "text-emerald-700" : "text-rose-600"}`}>
                {product.available && product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
              </p>

              {product.shopId && (
                <Link
                  to={`/customer/shops/${product.shopId}`}
                  className="mt-6 flex items-center gap-3 rounded-md border border-gray-100 p-4 hover:border-emerald-200"
                >
                  <Store className="h-6 w-6 text-emerald-700" />
                  <span className="min-w-0">
                    <span className="block text-xs text-gray-500">Sold by</span>
                    <span className="block truncate font-semibold text-gray-900">{product.shop || "Local shop"}</span>
                    {product.shopLocation && (
                      <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" /> {product.shopLocation}
                      </span>
                    )}
                  </span>
                  <span className="ml-auto text-sm font-semibold text-emerald-700">View shop</span>
                </Link>
              )}

              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center rounded-md border border-gray-200">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-2.5">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(Math.max(1, product.stock), value + 1))} disabled={quantity >= product.stock} className="p-2.5 disabled:opacity-40">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {cartError && <p role="alert" className="mt-3 text-sm text-rose-600">{cartError}</p>}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={adding || !product.available || product.stock < 1}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-700 px-4 py-3 text-sm font-semibold text-emerald-800 disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" /> {adding ? "Adding..." : "Add to cart"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={adding || !product.available || product.stock < 1}
                  className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Order now
                </button>
              </div>
            </div>
          </div>
        )}

        {product?.id && <ProductRecommendations productId={product.id} />}
      </section>
    </CustomerShell>
  );
};

export default ProductDetail;
