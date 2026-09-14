import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import CardImage from "../components/common/CardImage";
import categories from "../data/categories.json";

const Categories = () => {
  return (
    <section id="categories" className="bg-white py-10 lg:py-14">
      <div className="container-app">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">Neighborhood aisles</p>
            <h2 className="mt-1 font-display text-2xl font-bold lg:text-3xl">Shop by category</h2>
          </div>
          <Link to="/categories" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {categories.map((category, index) => {
            const Icon = Icons[category.icon] || Icons.ShoppingBag;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  to={`/marketplace/${category.slug}`}
                  className="card-surface card-shine group relative block overflow-hidden"
                >
                  <div className="card-media relative h-36 sm:h-44">
                    <CardImage src={category.cover} alt={category.name} category={category.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-dark)]/85 via-[var(--color-primary-dark)]/25 to-transparent" />
                    <span className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-[var(--color-primary)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 z-10 p-3">
                      <h3 className="font-display text-sm font-bold text-white">{category.name}</h3>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-white/80">{category.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
