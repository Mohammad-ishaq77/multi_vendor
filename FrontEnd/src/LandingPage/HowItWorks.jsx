import { motion } from "framer-motion";
import { MapPin, ShoppingCart, ClipboardCheck, Truck, ArrowRight } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: MapPin,
    title: "Choose a Shop",
    desc: "Browse trusted local shops in your neighborhood.",
    gradient: "from-emerald-400 to-[#1B4332]",
  },
  {
    num: "02",
    icon: ShoppingCart,
    title: "Select Products",
    desc: "Add fresh products & essentials to your cart.",
    gradient: "from-teal-400 to-emerald-600",
  },
  {
    num: "03",
    icon: ClipboardCheck,
    title: "Place Order",
    desc: "Checkout securely with multiple payment options.",
    gradient: "from-[#1B4332] to-emerald-700",
  },
  {
    num: "04",
    icon: Truck,
    title: "Fast Delivery",
    desc: "Get everything delivered to your doorstep in minutes.",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-24 lg:py-32 bg-[#f8faf9] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#1B4332]/20 to-transparent" />
      <div className="absolute top-20 right-0 w-72 h-72 bg-[#1B4332]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-[#1B4332] bg-[#1B4332]/10 rounded-full uppercase mb-5">
            Simple Steps
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4 leading-[1.1]">
            How NearMart <span className="text-[#1B4332]">Works?</span>
          </h2>
          <p className="font-sans text-[#64748B] max-w-lg mx-auto text-base leading-relaxed">
            From discovery to doorstep — your local shopping journey in 4 simple steps.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative">
          {/* Animated connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-[3.25rem] left-[12%] right-[12%] h-0.5 bg-gray-200">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-emerald-400 via-[#1B4332] to-emerald-500 origin-left"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="group relative flex flex-col items-center text-center"
              >
                {/* Step Number (Large watermark) */}
                <span className="absolute -top-6 text-7xl font-black text-gray-100 select-none transition-colors duration-500 group-hover:text-[#1B4332]/10">
                  {step.num}
                </span>

                {/* Icon Circle */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl shadow-emerald-900/20 mb-8 group-hover:shadow-2xl group-hover:shadow-emerald-900/30 transition-shadow duration-500`}
                >
                  <step.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                  
                  {/* Pulse ring animation */}
                  <div className="absolute inset-0 rounded-3xl bg-white opacity-0 group-hover:animate-ping group-hover:opacity-20" />
                </motion.div>

                {/* Content */}
                <h3 className="font-sans text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#1B4332] transition-colors">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-[#64748B] leading-relaxed max-w-[220px]">
                  {step.desc}
                </p>

                {/* Arrow (mobile) */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 text-gray-300">
                    <ArrowRight className="w-5 h-5 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-6 px-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50">
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#1B4332]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#0F172A]">Avg. Delivery Time</p>
                <p className="text-xs text-[#64748B]">Under 25 minutes</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-100" />
            <button className="flex items-center gap-2 px-6 py-3 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#143728] transition-colors">
              Start Shopping Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;