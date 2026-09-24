import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import CustomerShell from "../components/CustomerShell";
import ShopCard from "../components/ShopCard";
import EmptyState from "../../../components/ui/EmptyState";
import { shops } from "../data/customerData";

const Shops = () => {
  return (
    <CustomerShell>
      <section>
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Shops</h1>
        <p className="mb-8 text-(--color-text-muted)">Discover trusted local stores near you.</p>
        {shops.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No shops yet"
            description="Local stores will appear here once they are listed on NearMart."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {shops.map((shop) => (
              <Link key={shop.id} to={`/customer/shops/${shop.id}`} className="h-full">
                <ShopCard shop={shop} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </CustomerShell>
  );
};

export default Shops;
