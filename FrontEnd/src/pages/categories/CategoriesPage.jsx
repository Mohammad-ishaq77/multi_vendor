import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import CardImage from "../../components/common/CardImage";
import MainLayout from "../../layouts/MainLayout";
import PageHero from "../../components/hero/PageHero";
import { pageHeroes } from "../../config/heroes";
import categories from "../../data/categories.json";

const CategoriesPage = () => {
  return (
    <MainLayout>
      <PageHero {...pageHeroes.categories} />

      <section className="bg-white py-10 lg:py-14">
        <div className="container-app">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <Link to={`/marketplace/${category.slug}`} className="card-surface card-shine group flex h-full flex-col overflow-hidden">
                    <div className="card-media relative h-48 overflow-hidden">
                      <CardImage src={category.cover} alt={category.name} category={category.name} className="h-full w-full object-cover" />
                      <span className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-[var(--color-primary)]">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-display text-lg font-bold">{category.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-muted)]">{category.description}</p>
                      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-[var(--color-primary)]">
                        {category.ctaLabel}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default CategoriesPage;
