import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import CustomerShell from "../components/CustomerShell";
import ProductCard from "../components/ProductCard";
import { productService } from "../../../services/catalogService";
import { normalizeProducts } from "../../../utils/normalize";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useCart } from "../context/CartContext";

const readIds = () => {
  try {
    const ids = JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]");
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
};

const Wishlist = () => {
  const [ids, setIds] = useState(readIds);
  const [cartError, setCartError] = useState("");
  const { addToCart } = useCart();
  const state = useAsyncData(
    () => productService.list({ limit: 100 }).then(({ items }) => normalizeProducts(items)),
    []
  );
  const saved = useMemo(
    () => (state.data || []).filter((product) => ids.includes(String(product.id))),
    [ids, state.data]
  );

  useEffect(() => {
    const refresh = () => setIds(readIds());
    window.addEventListener("nearmart-wishlist-change", refresh);
    return () => window.removeEventListener("nearmart-wishlist-change", refresh);
  }, []);

  const removeFromWishlist = (productId) => {
    const next = ids.filter((id) => id !== String(productId));
    setIds(next);
    localStorage.setItem("nearmart_wishlist", JSON.stringify(next));
    window.dispatchEvent(new Event("nearmart-wishlist-change"));
  };

  const moveAllToCart = async () => {
    setCartError("");
    for (const product of saved) {
      const result = await addToCart(product);
      if (!result.ok) {
        setCartError(result.error || "Could not move all products to your cart.");
        return;
      }
    }
    localStorage.setItem("nearmart_wishlist", JSON.stringify([]));
    setIds([]);
    window.dispatchEvent(new Event("nearmart-wishlist-change"));
  };

  return (
    <CustomerShell>
      <section className="w-full">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="mt-1 text-sm text-gray-500">{saved.length} available saved product{saved.length === 1 ? "" : "s"}</p>
          </div>
          {saved.length > 0 && (
            <button type="button" onClick={moveAllToCart} className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">
              <ShoppingBag className="h-4 w-4" /> Move all to cart
            </button>
          )}
        </div>
        {cartError && <p role="alert" className="mb-4 text-sm text-rose-600">{cartError}</p>}
        {state.loading ? (
          <p className="py-12 text-center text-sm text-gray-500">Loading saved products...</p>
        ) : state.error ? (
          <div role="alert" className="py-12 text-center text-sm text-rose-700">
            <p>Saved products could not be loaded. {state.error}</p>
            <button type="button" onClick={state.reload} className="mt-3 font-semibold underline">Retry</button>
          </div>
        ) : saved.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {saved.map((product, index) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} index={index} onAddToCart={addToCart} />
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                  className="absolute right-2 top-2 z-10 rounded-full bg-white p-2 text-rose-600 shadow"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-100 bg-white px-6 py-12 text-center">
            <Heart className="mx-auto h-10 w-10 text-rose-300" />
            <h2 className="mt-3 font-semibold text-gray-900">No available saved products</h2>
            <p className="mt-1 text-sm text-gray-500">Save a product from the catalog to find it here.</p>
            <Link to="/customer/products" className="mt-5 inline-flex items-center gap-2 font-semibold text-emerald-700">
              Browse products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
    </CustomerShell>
  );
};

export default Wishlist;
