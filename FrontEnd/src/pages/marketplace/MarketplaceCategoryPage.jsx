import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import PageHero from "../../components/hero/PageHero";
import MarketplaceProductCard from "../../components/cards/MarketplaceProductCard";
import MarketplaceShopCard from "../../components/cards/MarketplaceShopCard";
import EmptyState from "../../components/ui/EmptyState";
import NotFound from "../not-found/NotFound";
import categories from "../../data/categories.json";
import CardImage from "../../components/common/CardImage";
import { getCategoryBySlug, getRelatedProducts, getRelatedVendors, sortProducts } from "../../utils/marketplace";

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: low to high" },
  { id: "price-high", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
];

const MarketplaceCategoryPage = () => {
  const { slug } = useParams();
  const category = getCategoryBySlug(slug);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("featured");

  const shops = useMemo(() => getRelatedVendors(category), [category]);
  const allProducts = useMemo(() => getRelatedProducts(category), [category]);
  const products = useMemo(() => {
    const filtered = allProducts.filter((item) =>
      [item.name, item.shop, item.unit].join(" ").toLowerCase().includes(query.trim().toLowerCase())
    );
    return sortProducts(filtered, sortKey);
  }, [allProducts, query, sortKey]);

  const related = useMemo(
    () => categories.filter((item) => item.slug !== slug).slice(0, 6),
    [slug]
  );

  if (!category) return <NotFound />;

  return (
    <MainLayout>
      <section className="bg-slate-50 py-4 shadow-xs">
        <div className="container-app flex flex-col gap-2 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Filter ${category.name.toLowerCase()}`}
              aria-label={`Filter ${category.name} products`}
              className="input-field !min-h-10 pl-11"
            />
          </div>
          <label className="relative lg:w-52">
            <span className="sr-only">Sort {category.name} products</span>
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="input-field !min-h-10 appearance-none pl-10">
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {shops.length > 0 && (
        <section className="bg-slate-50 py-6 lg:py-8">
          <div className="container-app">
            <h2 className="mb-3 font-display text-lg font-bold">Stores</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {shops.map((shop) => (
                <MarketplaceShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-slate-50 py-6 lg:py-8">
        <div className="container-app">
          <h2 className="mb-3 font-display text-lg font-bold">{products.length} products</h2>
          {products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {products.map((product) => (
                <MarketplaceProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState title={`No ${category.name.toLowerCase()} matches`} description="Clear the filter or open another category." />
          )}
        </div>
      </section>

      {/* Horizontal Carousel-Based Categories Section */}
      <section className="bg-slate-50 py-8 overflow-hidden">
        <div className="container-app">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">Quick Navigation</span>
              <h2 className="font-display text-xl font-extrabold text-slate-900">Explore Other Categories</h2>
            </div>
            <Link to="/categories" className="text-xs font-bold text-emerald-700 hover:underline">View All</Link>
          </div>

          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {related.map((item) => (
              <Link
                key={item.slug}
                to={`/marketplace/${item.slug}`}
                className="group relative h-44 w-60 shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-300"
              >
                <CardImage
                  src={item.cover}
                  alt={item.name}
                  category={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5">
                  <span className="inline-block rounded-md bg-emerald-500/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                    Category
                  </span>
                  <h3 className="mt-1 font-display text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default MarketplaceCategoryPage;
