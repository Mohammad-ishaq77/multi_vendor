import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "../../../services/catalogService";
import { normalizeProducts } from "../../../utils/normalize";
import { useAsyncData } from "../../../hooks/useAsyncData";
import CustomerShell from "../components/CustomerShell";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [params, setParams] = useSearchParams();
  const search = (params.get("search") || "").trim().toLowerCase();
  const category = params.get("category") || "";
  const sort = params.get("sort") || "";
  const state = useAsyncData(
    () => productService.list({ limit: 100 }).then(({ items }) => normalizeProducts(items)),
    []
  );
  const products = state.data || [];
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products]
  );
  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = !search ||
        `${product.name} ${product.shop} ${product.category}`.toLowerCase().includes(search);
      const matchesCategory = !category || product.category.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCategory;
    });
    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
    if (sort === "rating-desc") filtered.sort((a, b) => b.rating - a.rating);
    if (sort === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [products, search, category, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <CustomerShell>
      <section className="w-full">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Products</h1>
        <p className="mt-1 text-sm text-gray-500">Products listed by NearMart shops.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            value={params.get("search") || ""}
            onChange={(event) => updateParam("search", event.target.value)}
            placeholder="Search products or shops"
            className="w-full rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => updateParam("category", event.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(event) => updateParam("sort", event.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating-desc">Top rated</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>

        {state.loading ? (
          <p className="py-12 text-center text-sm text-gray-500">Loading products...</p>
        ) : state.error ? (
          <div role="alert" className="py-12 text-center text-sm text-rose-700">
            <p>Products could not be loaded. {state.error}</p>
            <button type="button" onClick={state.reload} className="mt-3 font-semibold underline">Retry</button>
          </div>
        ) : visible.length ? (
          <>
            <p className="mt-6 text-sm text-gray-500">{visible.length} product{visible.length === 1 ? "" : "s"}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <h2 className="font-semibold text-gray-900">No products found</h2>
            <p className="mt-1 text-sm text-gray-500">
              {products.length ? "Try changing your search or category filter." : "Approved shops have not listed products yet."}
            </p>
          </div>
        )}
      </section>
    </CustomerShell>
  );
};

export default Products;
