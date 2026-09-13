import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingBasket,
  Salad,
  Milk,
  CupSoda,
  Shirt,
  Smartphone,
  Pill,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import CustomerShell from "../components/CustomerShell";
import CategoryCard from "../components/CategoryCard";

// Map category names to Lucide icons
const iconMap = {
  Grocery: ShoppingBasket,
  "Fruits & Vegetables": Salad,
  "Dairy & Bakery": Milk,
  Beverages: CupSoda,
  Clothing: Shirt,
  Electronics: Smartphone,
  Pharmacy: Pill,
  Beauty: Sparkles,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 14 } },
};

const heroVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const categories = [
  { id: 1, name: "Grocery", icon: "🛒", count: 1240 },
  { id: 2, name: "Fruits & Vegetables", icon: "🥦", count: 856 },
  { id: 3, name: "Dairy & Bakery", icon: "🥛", count: 432 },
  { id: 4, name: "Beverages", icon: "🥤", count: 678 },
  { id: 5, name: "Clothing", icon: "👕", count: 2340 },
  { id: 6, name: "Electronics", icon: "📱", count: 567 },
  { id: 7, name: "Pharmacy", icon: "💊", count: 890 },
  { id: 8, name: "Beauty", icon: "💄", count: 1120 },
];

const Categories = () => {
  const navigate = useNavigate();

  return (
    <CustomerShell>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#14261f] tracking-tight">
            Categories
          </h1>
          <p className="text-gray-500 mt-2">Browse products by category.</p>
        </motion.div>

        {/* Hero Banner */}
        <motion.div
          variants={heroVariants}
          className="relative bg-gradient-to-br from-[#155c43] via-[#1a6b4e] to-[#0d4a32] text-white rounded-3xl p-6 md:p-8 mb-10 overflow-hidden shadow-2xl shadow-[#155c43]/20"
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-white/[0.08]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border border-white/[0.06]"
            />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Explore All Categories</h2>
              <p className="text-green-100/70 mt-2 text-sm md:text-base max-w-md">
                Find exactly what you need from our wide range of local store categories.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Search Categories</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          {categories.map((category, index) => {
            const Icon = iconMap[category.name] || ShoppingBasket;
            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                custom={index}
                whileHover={{ y: -8, scale: 1.03, transition: { type: "spring", stiffness: 300 } }}
                onClick={() =>
                  navigate(`/customer/products?category=${encodeURIComponent(category.name)}`)
                }
                className="group cursor-pointer"
              >
                <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-[#155c43]/5 hover:border-[#155c43]/10 transition-all duration-300 relative overflow-hidden">
                  {/* Background orb */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#155c43]/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#edf7f1] to-[#dff1e7] flex items-center justify-center mb-4 group-hover:from-[#155c43] group-hover:to-[#1a6b4e] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md"
                  >
                    <Icon className="w-7 h-7 text-[#155c43] group-hover:text-white transition-colors" />
                  </motion.div>

                  <h3 className="relative font-semibold text-sm text-[#14261f] group-hover:text-[#155c43] transition-colors">
                    {category.name}
                  </h3>
                  <p className="relative text-xs text-gray-400 mt-1">{category.count} products</p>

                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute bottom-4 right-4 text-[#155c43]"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </CustomerShell>
  );
};

export default Categories;