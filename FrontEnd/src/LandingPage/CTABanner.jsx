import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const CTABanner = () => {
  return (
    <section className="py-20 lg:py-28 px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] p-12 lg:p-16 text-center"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl" />

        <div className="relative z-10">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Ready to Shop Smarter?
          </h2>
          <p className="text-lg text-white/80 max-w-lg mx-auto mb-10 leading-relaxed">
            Support local businesses while enjoying faster delivery and better prices.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shops">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-4 bg-white text-[#2563EB] text-sm font-bold rounded-full shadow-xl shadow-blue-900/20 hover:shadow-2xl transition-shadow"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-sm font-bold rounded-full border border-white/20 hover:bg-white/20 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Become Seller
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTABanner;