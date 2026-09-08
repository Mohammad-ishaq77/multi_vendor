import { motion } from "framer-motion";
import { ArrowRight, Heart, Star, Clock, MapPin } from "lucide-react";

const shops = [
  {
    name: "MB Collection",
    category: "Fashion",
    rating: 4.5,
    reviews: 230,
    time: "30-40 mins",
    image: "/images/shopping.png",
  },
  {
    name: "Fresh Basket",
    category: "Grocery",
    rating: 4.6,
    reviews: 315,
    time: "20-30 mins",
    image: "/images/freshbasket.jpg",
  },
  {
    name: "Kiryana Plus",
    category: "Daily Needs",
    rating: 4.3,
    reviews: 195,
    time: "15-25 mins",
    image: "/images/kiryanishop.webp",
  },
  {
    name: "Health Plus",
    category: "Pharmacy",
    rating: 4.7,
    reviews: 260,
    time: "20-30 mins",
    image: "/images/healthplus.webp",
  },
];

const FeaturedShops = () => {
  return (
    <section id="shops" className="py-20 lg:py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-[#1B4332] bg-[#1B4332]/10 rounded-full uppercase mb-4">
              Nearby
            </span>
            <h2 className="font-serif text-3xl lg:text-5xl font-bold text-[#0F172A] leading-[1.1]">
              Popular Shops Near You
            </h2>
          </div>
          <motion.button
            whileHover={{ x: 4 }}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#1B4332] hover:text-[#143728] transition-colors group"
          >
            View all shops
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Shops Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shops.map((shop, index) => (
            <motion.div
              key={shop.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/60 hover:-translate-y-3 hover:border-gray-200"
            >
              {/* Image Container */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#1B4332] bg-white/95 backdrop-blur-sm rounded-full uppercase shadow-sm">
                    {shop.category}
                  </span>
                </div>

                {/* Heart Button */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white shadow-lg transition-all duration-300"
                >
                  <Heart className="w-4 h-4" />
                </motion.button>

                {/* Hover Shop Now */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <button className="w-full py-2.5 bg-white/95 backdrop-blur-sm text-[#0F172A] text-xs font-bold rounded-xl shadow-lg hover:bg-[#1B4332] hover:text-white transition-colors">
                    Visit Shop
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-sans text-base font-bold text-[#0F172A] mb-3 group-hover:text-[#1B4332] transition-colors">
                  {shop.name}
                </h3>

                <div className="flex items-center justify-between">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-700">{shop.rating}</span>
                    </div>
                    <span className="font-sans text-xs text-[#64748B]">({shop.reviews})</span>
                  </div>

                  {/* Delivery Time */}
                  <div className="flex items-center gap-1 text-xs font-medium text-[#64748B] bg-gray-50 px-2.5 py-1.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-sans">{shop.time}</span>
                  </div>
                </div>

                {/* Location hint */}
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
                  <MapPin className="w-3 h-3" />
                  <span className="font-sans">Within 2 km</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="sm:hidden mt-8 text-center">
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B4332]">
            View all shops <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedShops;