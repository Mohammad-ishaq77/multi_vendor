import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Package, Search, Store, X } from "lucide-react";
import { getVendorMarketplacePath, searchCatalog } from "../../utils/marketplace";

const MarketplaceSearch = ({
  variant = "nav",
  placeholder = "Search products, shops and categories",
  autoFocus = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/marketplace") {
      setQuery(new URLSearchParams(location.search).get("q") || "");
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const results = useMemo(() => {
    const term = query.trim();
    if (term.length < 1) return { products: [], vendors: [], categories: [] };
    const matched = searchCatalog(term);
    return {
      products: matched.products.slice(0, 5),
      vendors: matched.vendors.slice(0, 3),
      categories: matched.categories.slice(0, 3),
    };
  }, [query]);

  const hasResults = results.products.length + results.vendors.length + results.categories.length > 0;
  const showPanel = open && query.trim().length > 0;

  const goToSearch = (term = query) => {
    const next = term.trim();
    setOpen(false);
    navigate(next ? `/marketplace?q=${encodeURIComponent(next)}` : "/marketplace");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    goToSearch();
  };

  const hero = variant === "hero";
  const mobile = variant === "mobile";

  return (
    <div ref={wrapRef} className={`relative ${hero || mobile ? "w-full" : "min-w-0 flex-1"}`}>
      <form onSubmit={handleSubmit} role="search" className="relative">
        <Search
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] ${
            hero || mobile ? "left-4 h-4 w-4" : "left-3.5 h-4 w-4"
          }`}
        />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          enterKeyHint="search"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label="Search marketplace"
          className={
            hero
              ? "h-12 w-full rounded-2xl border border-white/70 bg-white pl-11 pr-[6.5rem] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-white"
              : mobile
                ? "h-11 w-full rounded-xl border border-[var(--color-green-soft)] bg-[var(--color-surface)] pl-11 pr-[5.75rem] text-sm outline-none"
                : "h-10 w-full rounded-full border border-[var(--color-green-soft)] bg-[var(--color-surface)] pl-10 pr-[6.25rem] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-green)] focus:bg-white focus:ring-4 focus:ring-[var(--color-green-light)]/15"
          }
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Clear search"
            className={`absolute top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-green-bg)] hover:text-[var(--color-text)] ${
              hero || mobile ? "right-[4.6rem]" : "right-[5.15rem]"
            }`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="submit"
          className={
            hero
              ? "btn-on-green absolute right-1.5 top-1/2 !min-h-9 -translate-y-1/2 !rounded-xl !px-3.5 !text-sm"
              : "absolute right-1 top-1/2 inline-flex h-8 -translate-y-1/2 items-center rounded-full bg-[var(--color-primary)] px-3.5 text-xs font-semibold text-white hover:bg-[var(--color-primary-dark)]"
          }
        >
          Search
        </button>
      </form>

      {showPanel && (
        <div
          className={`absolute z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--color-green-soft)] bg-white shadow-[0_18px_40px_-20px_rgba(6,78,59,0.35)] ${
            hero ? "left-0 right-0" : "inset-x-0"
          }`}
        >
          {hasResults ? (
            <div className="max-h-80 overflow-y-auto py-2">
              {results.categories.length > 0 && (
                <SuggestionGroup title="Categories">
                  {results.categories.map((category) => (
                    <Link
                      key={category.slug}
                      to={`/marketplace/${category.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-[var(--color-green-bg)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-green-bg)] text-[var(--color-primary)]">
                        <LayoutGrid className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block font-semibold text-[var(--color-text)]">{category.name}</span>
                        <span className="block text-[11px] text-[var(--color-text-muted)]">{category.description}</span>
                      </span>
                    </Link>
                  ))}
                </SuggestionGroup>
              )}
              {results.vendors.length > 0 && (
                <SuggestionGroup title="Shops">
                  {results.vendors.map((shop) => (
                    <Link
                      key={shop.id}
                      to={getVendorMarketplacePath(shop)}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-[var(--color-green-bg)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-green-bg)] text-[var(--color-primary)]">
                        <Store className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block font-semibold text-[var(--color-text)]">{shop.name}</span>
                        <span className="block text-[11px] text-[var(--color-text-muted)]">
                          {shop.category} · {shop.location}
                        </span>
                      </span>
                    </Link>
                  ))}
                </SuggestionGroup>
              )}
              {results.products.length > 0 && (
                <SuggestionGroup title="Products">
                  {results.products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => goToSearch(product.name)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[var(--color-green-bg)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-green-bg)] text-[var(--color-primary)]">
                        <Package className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-[var(--color-text)]">{product.name}</span>
                        <span className="block text-[11px] text-[var(--color-text-muted)]">
                          {product.shop} · ₹{product.price}
                        </span>
                      </span>
                    </button>
                  ))}
                </SuggestionGroup>
              )}
            </div>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
              No matches for “{query.trim()}”
            </p>
          )}
          <button
            type="button"
            onClick={() => goToSearch()}
            className="flex w-full items-center justify-center gap-2 border-t border-[var(--color-green-soft)] bg-[var(--color-surface)] px-3 py-2.5 text-xs font-semibold text-[var(--color-primary-dark)] hover:bg-[var(--color-green-bg)]"
          >
            <Search className="h-3.5 w-3.5" />
            Search all results for “{query.trim()}”
          </button>
        </div>
      )}
    </div>
  );
};

const SuggestionGroup = ({ title, children }) => (
  <div className="px-1 py-1">
    <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
      {title}
    </p>
    {children}
  </div>
);

export default MarketplaceSearch;
