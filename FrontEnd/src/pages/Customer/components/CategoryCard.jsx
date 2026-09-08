import React from "react";
import { motion } from "framer-motion";

const CategoryCard = ({ category, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative w-full bg-white border border-gray-100 rounded-2xl p-5 text-center 
        hover:shadow-xl hover:shadow-[#155c43]/5 hover:border-[#155c43]/20 
        transition-colors duration-300 overflow-hidden"
    >
      {/* Subtle gradient orb on hover */}
      <motion.div
        className="absolute -top-6 -right-6 w-20 h-20 bg-[#155c43]/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* Icon Container */}
      <motion.div
        whileHover={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.5 }}
        className="relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#edf7f1] to-[#dff1e7] 
          flex items-center justify-center text-3xl mb-4 
          group-hover:from-[#155c43] group-hover:to-[#1a6b4e] group-hover:text-white 
          transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-[#155c43]/20"
      >
        {category.icon}
      </motion.div>

      {/* Name */}
      <p className="relative text-sm font-semibold text-gray-700 group-hover:text-[#155c43] transition-colors duration-300">
        {category.name}
      </p>

      {/* Optional count badge */}
      {category.count && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 right-3 text-[0.65rem] font-bold text-[#155c43] bg-[#155c43]/10 px-2 py-0.5 rounded-full"
        >
          {category.count}
        </motion.span>
      )}
    </motion.button>
  );
};

export default CategoryCard;