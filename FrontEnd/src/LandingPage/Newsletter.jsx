import { useState } from "react";
import { motion } from "framer-motion";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-12 bg-[#1B4332]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
              Get the Best Offers & Updates
            </h3>
            <p className="text-sm text-white/70">
              Subscribe to our newsletter and never miss any updates.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex w-full lg:w-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 lg:w-72 px-5 py-3 rounded-l-xl text-sm text-[#0F172A] placeholder-gray-400 outline-none bg-white"
            />
            <button className="px-6 py-3 bg-[#0F172A] text-white text-sm font-semibold rounded-r-xl hover:bg-[#1e293b] transition-colors">
              Subscribe
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;