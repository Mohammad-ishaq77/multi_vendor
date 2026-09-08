import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Flame, TrendingUp, Zap } from "lucide-react";

const products = [
  {
    name: "Nike Air Sneakers",
    size: "UK 7-11",
    price: 2499,
    originalPrice: 4599,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    badge: "Trending",
    badgeColor: "bg-rose-500",
  },
  {
    name: "Snack Combo Pack",
    size: "Lays + Coke + More",
    price: 99,
    originalPrice: 149,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop",
    badge: "Hot",
    badgeColor: "bg-orange-500",
  },
  {
    name: "Wireless Headphones",
    size: "Over-Ear",
    price: 1299,
    originalPrice: 2499,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    badge: "60% Off",
    badgeColor: "bg-[#1B4332]",
  },
  {
    name: "Aloe Vera Face Gel",
    size: "150 ml",
    price: 149,
    originalPrice: 299,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    badge: null,
    badgeColor: "",
  },
  {
    name: "Indoor Monstera Plant",
    size: "With Pot",
    price: 399,
    originalPrice: 699,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop",
    badge: "Bestseller",
    badgeColor: "bg-amber-500",
  },
];

const PopularProducts = () => {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-[#1B4332] bg-[#1B4332]/10 rounded-full uppercase mb-4">
              Top Picks
            </span>
            <h2 className="font-serif text-3xl lg:text-5xl font-bold text-[#0F172A] leading-[1.1]">
              Popular Products
            </h2>
          </div>
          <motion.button
            whileHover={{ x: 4 }}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#1B4332] hover:text-[#143728] transition-colors group"
          >
            View all products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500"
            >
              {/* Badge */}
              {product.badge && (
                <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 ${product.badgeColor} text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1`}>
                  {product.badge === "Hot" && <Flame className="w-3 h-3" />}
                  {product.badge === "Trending" && <TrendingUp className="w-3 h-3" />}
                  {product.badge === "60% Off" && <Zap className="w-3 h-3" />}
                  {product.badge}
                </div>
              )}

              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Quick Add Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white text-[#0F172A] text-xs font-bold rounded-full shadow-lg flex items-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Quick Add
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-sans text-sm font-bold text-[#0F172A] mb-0.5 line-clamp-1 group-hover:text-[#1B4332] transition-colors">
                  {product.name}
                </h3>
                <p className="font-sans text-[11px] text-[#94a3b8] mb-3">{product.size}</p>
                
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="font-sans text-lg font-bold text-[#0F172A]">₹{product.price}</span>
                  <span className="font-sans text-xs text-[#94a3b8] line-through">₹{product.originalPrice}</span>
                  <span className="font-sans text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1B4332] text-white text-xs font-semibold rounded-xl hover:bg-[#143728] transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span className="font-sans">Add to Cart</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="sm:hidden mt-8 text-center">
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B4332]">
            View all products <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;