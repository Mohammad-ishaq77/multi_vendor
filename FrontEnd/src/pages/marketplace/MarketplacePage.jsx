import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import PageHero from "../../components/hero/PageHero";
import { pageHeroes } from "../../config/heroes";
import MarketplaceProductCard from "../../components/cards/MarketplaceProductCard";
import MarketplaceShopCard from "../../components/cards/MarketplaceShopCard";
import EmptyState from "../../components/ui/EmptyState";
import categories from "../../data/categories.json";
import { searchCatalog, sortProducts } from "../../utils/marketplace";

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: low to high" },
  { id: "price-high", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
];

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [sortKey, setSortKey] = useState("featured");
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  const results = useMemo(() => searchCatalog(query), [query]);
  const products = useMemo(() => sortProducts(results.products, sortKey), [results.products, sortKey]);

  const handleSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (draft.trim()) next.set("q", draft.trim());
    else next.delete("q");
    setSearchParams(next);
  };

  return (
    <MainLayout>
      {query ? (
        <PageHero
          {...pageHeroes.search}
          title={`Results for “${query}”`}
          highlight=""
          description={`Products, shops and categories matching “${query}” across NearMart.`}
        />
      ) : (
        <PageHero {...pageHeroes.marketplace} />
      )}

      <section className="border-b border-[var(--color-green-soft)] bg-white py-4">
        <div className="container-app">
          <form onSubmit={handleSearch} className="flex flex-col gap-2 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Search products, shops or categories"
                aria-label="Search marketplace"
                className="input-field !min-h-10 pl-11"
              />
            </div>
            <div className="flex gap-2">
              <label className="relative min-w-[160px] flex-1 lg:flex-none">
                <span className="sr-only">Sort products</span>
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="input-field !min-h-10 appearance-none pl-10 pr-8"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn-primary !min-h-10">
                <Filter className="h-4 w-4" />
                Search
              </button>
            </div>
          </form>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/marketplace/${category.slug}`}
                className="shrink-0 rounded-full bg-[var(--color-green-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-dark)]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-surface-tint)] py-6 lg:py-8">
        <div className="container-app">
          <h2 className="mb-3 font-display text-lg font-bold">{query ? "Shops" : "Shops near you"}</h2>
          {results.vendors.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {results.vendors.map((shop) => (
                <MarketplaceShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <EmptyState title="No shops match" description="Try a broader search." />
          )}
        </div>
      </section>

      {query && results.categories.length > 0 && (
        <section className="bg-white py-6">
          <div className="container-app">
            <h2 className="mb-3 font-display text-lg font-bold">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {results.categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/marketplace/${category.slug}`}
                  className="rounded-full bg-[var(--color-green-bg)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-dark)] hover:bg-[var(--color-green-soft)]"
                >
                  {category.name}
                </Link>
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
            <EmptyState title="No products found" description="Clear search or pick a category." />
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default MarketplacePage;
