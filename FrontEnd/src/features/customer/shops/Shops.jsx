import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { shopService } from "../../../services/catalogService";
import { normalizeShops } from "../../../utils/normalize";
import { useAsyncData } from "../../../hooks/useAsyncData";
import CustomerShell from "../components/CustomerShell";
import ShopCard from "../components/ShopCard";

const Shops = () => {
  const navigate = useNavigate();
  const state = useAsyncData(
    () => shopService.list({ limit: 100 }).then(({ items }) => normalizeShops(items)),
    []
  );
  const shops = state.data || [];

  return (
    <CustomerShell>
      <section>
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Shops</h1>
        <p className="mb-8 text-(--color-text-muted)">Discover NearMart shops and browse their products.</p>
        {state.loading ? (
          <p className="py-12 text-center text-sm text-gray-500">Loading shops...</p>
        ) : state.error ? (
          <div role="alert" className="py-12 text-center text-sm text-rose-700">
            <p>Shops could not be loaded. {state.error}</p>
            <button type="button" onClick={state.reload} className="mt-3 font-semibold underline">Retry</button>
          </div>
        ) : shops.length === 0 ? (
          <div className="py-12 text-center">
            <Store className="mx-auto h-10 w-10 text-gray-300" />
            <h2 className="mt-3 font-semibold text-gray-900">No approved shops yet</h2>
            <p className="mt-1 text-sm text-gray-500">Shops appear here after completing NearMart approval.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {shops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onClick={() => navigate(`/customer/shops/${shop.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </CustomerShell>
  );
};

export default Shops;
