import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { productService } from "../../services/catalogService";
import { normalizeProduct } from "../../utils/normalize";
import MarketplaceProductCard from "../cards/MarketplaceProductCard";

const ProductRecommendations = ({ productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    let isMounted = true;
    setLoading(true);

    productService
      .getRecommendations(productId, 4)
      .then((items) => {
        if (!isMounted) return;
        const normalized = (Array.isArray(items) ? items : []).map(normalizeProduct);
        setRecommendations(normalized);
      })
      .catch(() => {
        if (isMounted) setRecommendations([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-12 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
        <div className="flex items-center gap-2 text-emerald-800 font-bold mb-4">
          <Sparkles className="h-5 w-5 animate-pulse text-emerald-600" />
          <span>Finding AI Recommendations...</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 animate-pulse rounded-xl bg-white/80 border border-emerald-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 rounded-2xl border border-emerald-100 bg-linear-to-b from-emerald-50/50 to-white p-6 shadow-xs">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>AI ML Recommendations</span>
          </div>
          <h2 className="mt-2 text-xl font-extrabold text-slate-900 sm:text-2xl">Recommended for You</h2>
          <p className="text-xs text-slate-500">Based on category, price proximity, vendor matches, and item similarity.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recommendations.map((prod) => (
          <MarketplaceProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </section>
  );
};

export default ProductRecommendations;
