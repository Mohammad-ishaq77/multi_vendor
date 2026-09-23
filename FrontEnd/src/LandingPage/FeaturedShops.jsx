import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import vendors from "../data/vendors.json";
import MarketplaceShopCard from "../components/cards/MarketplaceShopCard";

const FeaturedShops = () => {
  return (
    <section id="shops" className="bg-white py-8 lg:py-10">
      <div className="container-app">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-primary)">Handpicked nearby</p>
            <h2 className="mt-1 font-display text-2xl font-bold lg:text-3xl">Shops near you</h2>
          </div>
          <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary)">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {vendors.map((shop, index) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`h-full ${index >= 4 ? "hidden sm:block" : ""}`}
            >
              <MarketplaceShopCard shop={shop} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedShops;
