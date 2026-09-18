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
      <PageHero
        variant={category.variant || "overlay"}
        eyebrow={category.name}
        title={category.headline}
        highlight={category.variant === "split" ? undefined : category.promise?.[0]}
        description={category.intro || category.story}
        image={category.cover}
        mosaic={related.slice(0, 3).map((item) => item.cover).filter(Boolean)}
        primaryTo="/marketplace"
        primaryLabel="All shops"
        secondaryTo="/categories"
        secondaryLabel="All aisles"
      />

      <section className="border-b border-[var(--color-green-soft)] bg-white py-3">
        <div className="container-app flex flex-col gap-2 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
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
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
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
        <section className="bg-[var(--color-surface-tint)] py-6 lg:py-8">
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

      <section className="bg-white py-6 lg:py-8">
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

      <section className="bg-[var(--color-green-bg)] py-6">
        <div className="container-app">
          <h2 className="mb-3 font-display text-lg font-bold">More categories</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {related.map((item) => (
                <Link key={item.slug} to={`/marketplace/${item.slug}`} className="card-surface card-shine overflow-hidden">
                  <div className="card-media relative h-20">
                    <CardImage src={item.cover} alt={item.name} category={item.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-[var(--color-primary-dark)]/45" />
                    <h3 className="absolute inset-x-0 bottom-2 z-10 px-2 text-center text-xs font-bold text-white">{item.name}</h3>
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
