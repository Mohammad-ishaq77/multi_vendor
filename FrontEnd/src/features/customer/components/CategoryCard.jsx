import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import CardImage from "../../../components/common/CardImage";

const CategoryCard = ({ category, onClick }) => {
  const Icon = Icons[category.icon] || Icons.ShoppingBag;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="card-surface card-shine group relative flex h-full w-full flex-col overflow-hidden text-left"
    >
      <div className="card-media relative h-32 w-full">
        <CardImage
          src={category.cover}
          alt={category.name}
          category={category.name}
          className="h-full w-full object-cover"
        />
        {category.count && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-2 py-0.5 text-[0.65rem] font-bold text-[var(--color-primary)]">
            {category.count}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-green-bg)] text-[var(--color-primary)]">
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
          {category.name}
        </p>
      </div>
    </motion.button>
  );
};

export default CategoryCard;
