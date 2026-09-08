import { motion } from "framer-motion";
import { Search, ArrowRight, Play } from "lucide-react";
import { useState } from "react";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Staggered text animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* TEXT CONTENT */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.span variants={item} className="inline-block">
              <span className="px-4 py-1.5 text-[11px] font-bold tracking-widest text-[#1B4332] bg-[#1B4332]/10 rounded-full uppercase">
                Your Local Stores, One Click Away
              </span>
            </motion.span>

            {/* Title - Serif Font (Elegant) */}
            <motion.h1
              variants={item}
              className="mt-5 mb-3 font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#0F172A] leading-[1.1]"
            >
              Shop Local.
            </motion.h1>
            
            <motion.h1
              variants={item}
              className="mb-5 font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1]"
            >
              <span className="text-[#1B4332]">Live Better.</span>
            </motion.h1>

            {/* Subtitle - Sans Font (Clean) */}
            <motion.p
              variants={item}
              className="font-sans text-base lg:text-lg text-[#64748B] leading-relaxed mb-8 max-w-md mx-auto lg:mx-0"
            >
              NearMart connects you with trusted local shops near you. Explore products, place orders and get fast delivery at your doorstep.
            </motion.p>

            {/* Search Bar */}
            <motion.div variants={item} className="flex items-center max-w-md mx-auto lg:mx-0 mb-7 rounded-2xl border border-gray-200 bg-white shadow-sm focus-within:shadow-md focus-within:border-[#1B4332]/30 transition-all duration-300 overflow-hidden">
              <div className="flex-1 flex items-center gap-3 px-5 py-3.5">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products, shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm text-[#0F172A] placeholder-gray-400 outline-none bg-transparent"
                />
              </div>
              <button className="px-6 py-3.5 bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#143728] transition-colors">
                Search
              </button>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#143728] transition-colors w-full sm:w-auto justify-center"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <button className="flex items-center gap-2 px-7 py-3 text-sm font-medium text-[#0F172A] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
                <div className="w-7 h-7 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
                  <Play className="w-3 h-3 text-[#1B4332] fill-[#1B4332] ml-0.5" />
                </div>
                How it Works
              </button>
            </motion.div>
          </motion.div>

          {/* IMAGE — First on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Soft glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-[#1B4332]/[0.06] rounded-full blur-3xl" />

            {/* Floating image */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative z-10 cursor-pointer"
            >
              <img
                src="/images/loginBg.png"
                alt="NearMart Illustration"
                className="relative z-10 w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[460px] h-auto object-contain drop-shadow-xl"
              />
            </motion.div>

            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute bottom-4 right-4 sm:right-8 lg:right-0 bg-white rounded-xl shadow-lg shadow-gray-100 px-4 py-2.5 flex items-center gap-2.5 border border-gray-50"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-[#0F172A]">Live in Srinagar</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;