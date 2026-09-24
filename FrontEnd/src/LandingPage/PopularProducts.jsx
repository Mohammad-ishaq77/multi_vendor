import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import products from "../data/products.json";
import MarketplaceProductCard from "../components/cards/MarketplaceProductCard";

const PopularProducts = () => {
  return (
    <section className="bg-white py-8 lg:py-10">
      <div className="container-app">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-primary)">Trending this week</p>
            <h2 className="mt-1 font-display text-2xl font-bold lg:text-3xl">Popular products</h2>
          </div>
          <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary)">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-4">
          {products.slice(0, 12).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              className="h-full"
            >
              <MarketplaceProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
