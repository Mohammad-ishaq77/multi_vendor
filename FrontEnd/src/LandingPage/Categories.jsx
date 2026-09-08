import { motion } from "framer-motion";
import { ArrowRight, ShoppingBasket, Apple, Milk, Coffee, Cookie, Sparkles, Home } from "lucide-react";

const categories = [
  {
    name: "Grocery",
    icon: ShoppingBasket,
    gradient: "from-emerald-100 to-teal-50",
    iconColor: "text-emerald-600",
    shadow: "shadow-emerald-100",
  },
  {
    name: "Fruits & Veggies",
    icon: Apple,
    gradient: "from-red-100 to-rose-50",
    iconColor: "text-red-500",
    shadow: "shadow-red-100",
  },
  {
    name: "Dairy & Bakery",
    icon: Milk,
    gradient: "from-sky-100 to-blue-50",
    iconColor: "text-sky-600",
    shadow: "shadow-sky-100",
  },
  {
    name: "Beverages",
    icon: Coffee,
    gradient: "from-amber-100 to-yellow-50",
    iconColor: "text-amber-600",
    shadow: "shadow-amber-100",
  },
  {
    name: "Snacks",
    icon: Cookie,
    gradient: "from-orange-100 to-amber-50",
    iconColor: "text-orange-500",
    shadow: "shadow-orange-100",
  },
  {
    name: "Personal Care",
    icon: Sparkles,
    gradient: "from-pink-100 to-rose-50",
    iconColor: "text-pink-500",
    shadow: "shadow-pink-100",
  },
  {
    name: "Household",
    icon: Home,
    gradient: "from-violet-100 to-purple-50",
    iconColor: "text-violet-600",
    shadow: "shadow-violet-100",
  },
];

const Categories = () => {
  return (
    <section id="categories" className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-[#1B4332] bg-[#1B4332]/10 rounded-full uppercase mb-4">
              Browse
            </span>
            <h2 className="font-serif text-3xl lg:text-5xl font-bold text-[#0F172A] leading-[1.1]">
              Shop by Categories
            </h2>
          </div>
          <motion.button
            whileHover={{ x: 4 }}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#1B4332] hover:text-[#143728] transition-colors group"
          >
            View all categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-5">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className={`group relative flex flex-col items-center gap-4 p-6 rounded-3xl bg-white border border-gray-100 cursor-pointer transition-all duration-300 hover:border-[#1B4332]/20 hover:shadow-xl ${cat.shadow}`}
            >
              {/* Icon Container */}
              <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <cat.icon className={`w-9 h-9 ${cat.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Text */}
              <span className="font-sans text-sm font-semibold text-[#0F172A] text-center leading-tight group-hover:text-[#1B4332] transition-colors">
                {cat.name}
              </span>

              {/* Hover indicator dot */}
              <div className="absolute bottom-3 w-1.5 h-1.5 rounded-full bg-[#1B4332] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="sm:hidden mt-8 text-center">
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B4332]">
            View all categories <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;