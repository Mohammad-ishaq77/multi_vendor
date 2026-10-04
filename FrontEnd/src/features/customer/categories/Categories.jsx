import { useNavigate } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { categoryService, productService } from "../../../services/catalogService";
import { normalizeCategories, normalizeProducts } from "../../../utils/normalize";
import { useAsyncData } from "../../../hooks/useAsyncData";
import CustomerShell from "../components/CustomerShell";

const Categories = () => {
  const navigate = useNavigate();
  const state = useAsyncData(async () => {
    const [categoryRecords, productPage] = await Promise.all([
      categoryService.list(),
      productService.list({ limit: 100 }),
    ]);
    const counts = normalizeProducts(productPage.items).reduce((result, product) => {
      if (product.categoryId) result[product.categoryId] = (result[product.categoryId] || 0) + 1;
      return result;
    }, {});
    return normalizeCategories(categoryRecords).map((category) => ({
      ...category,
      productCount: counts[category.id] || 0,
    }));
  }, []);

  return (
    <CustomerShell>
      <section>
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="mt-2 text-sm text-gray-500">Browse products currently listed by local shops.</p>
        {state.loading ? (
          <p className="py-12 text-center text-sm text-gray-500">Loading categories...</p>
        ) : state.error ? (
          <div role="alert" className="py-12 text-center text-sm text-rose-700">
            <p>Categories could not be loaded. {state.error}</p>
            <button type="button" onClick={state.reload} className="mt-3 font-semibold underline">Retry</button>
          </div>
        ) : state.data?.length ? (
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {state.data.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => navigate(`/customer/products?category=${encodeURIComponent(category.name)}`)}
                className="rounded-lg border border-gray-100 bg-white p-5 text-left transition hover:border-emerald-200 hover:shadow-md"
              >
                <ShoppingBasket className="h-8 w-8 text-emerald-700" />
                <h2 className="mt-4 font-semibold text-gray-900">{category.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {category.productCount} product{category.productCount === 1 ? "" : "s"}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-gray-500">No categories are available yet.</p>
        )}
      </section>
    </CustomerShell>
  );
};

export default Categories;
