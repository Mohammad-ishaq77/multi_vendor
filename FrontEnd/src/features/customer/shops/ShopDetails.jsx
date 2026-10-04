import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Heart, MapPin, Package, Store } from "lucide-react";
import { shopService } from "../../../services/catalogService";
import { normalizeProducts, normalizeShop } from "../../../utils/normalize";
import { useAsyncData } from "../../../hooks/useAsyncData";
import CardImage from "../../../components/common/CardImage";
import CustomerShell from "../components/CustomerShell";
import ProductCard from "../components/ProductCard";

const ShopDetails = () => {
  const { shopId } = useParams();
  const [favorite, setFavorite] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearmart_favorite_shops") || "[]").includes(shopId);
    } catch {
      return false;
    }
  });
  const state = useAsyncData(async () => {
    const [shopRecord, productPage] = await Promise.all([
      shopService.get(shopId),
      shopService.productsForShop(shopId, { limit: 100 }),
    ]);
    return {
      shop: normalizeShop(shopRecord),
      products: normalizeProducts(productPage.items),
    };
  }, [shopId], { enabled: Boolean(shopId) });
  const shop = state.data?.shop;
  const products = state.data?.products || [];

  const toggleFavorite = () => {
    let favorites = [];
    try {
      favorites = JSON.parse(localStorage.getItem("nearmart_favorite_shops") || "[]");
    } catch {
      favorites = [];
    }
    const next = favorite
      ? favorites.filter((id) => id !== shopId)
      : [...favorites, shopId];
    localStorage.setItem("nearmart_favorite_shops", JSON.stringify(next));
    setFavorite(!favorite);
  };

  return (
    <CustomerShell>
      <section className="w-full">
        <Link to="/customer/shops" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> All shops
        </Link>
        {state.loading ? (
          <p className="py-12 text-center text-sm text-gray-500">Loading shop...</p>
        ) : state.error ? (
          <div role="alert" className="py-12 text-center text-sm text-rose-700">
            <p>Shop could not be loaded. {state.error}</p>
            <button type="button" onClick={state.reload} className="mt-3 font-semibold underline">Retry</button>
          </div>
        ) : !shop ? (
          <div className="py-12 text-center">
            <Store className="mx-auto h-10 w-10 text-gray-300" />
            <h1 className="mt-3 text-xl font-bold text-gray-900">Shop not found</h1>
            <p className="mt-1 text-sm text-gray-500">This shop may not be approved or is no longer available.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-5 rounded-lg border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:p-7">
              <div className="h-40 w-full shrink-0 overflow-hidden rounded-md bg-gray-50 sm:w-48">
                <CardImage src={shop.image} alt={shop.name} category={shop.category} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {shop.category && <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{shop.category}</p>}
                    <h1 className="mt-1 text-2xl font-bold text-gray-900">{shop.name}</h1>
                  </div>
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    aria-label={favorite ? "Remove shop from favorites" : "Save shop to favorites"}
                    className={`rounded-full border p-2 ${favorite ? "border-rose-200 text-rose-600" : "border-gray-200 text-gray-500"}`}
                  >
                    <Heart className="h-5 w-5" fill={favorite ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
                  {shop.description || "Browse products sold by this local shop."}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                  {shop.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{shop.location}</span>}
                  {shop.deliveryTime && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{shop.deliveryTime}</span>}
                  <span className="flex items-center gap-1.5">Minimum order ₹{shop.minOrder.toFixed(2)}</span>
                  <span>{shop.isOpen ? "Open now" : "Currently closed"}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-xl font-bold text-gray-900">Products from {shop.name}</h2>
                <span className="text-sm text-gray-500">{products.length} products</span>
              </div>
              {products.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-100 bg-white py-12 text-center">
                  <Package className="mx-auto h-9 w-9 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">This shop has not listed any products yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </CustomerShell>
  );
};

export default ShopDetails;
