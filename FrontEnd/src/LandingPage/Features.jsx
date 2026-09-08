import { motion } from "framer-motion";
import { Store, Truck, ShieldCheck, Tag } from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Local Shops",
    desc: "Discover trusted local shops near you.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Quick and reliable delivery right to your doorstep.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "100% secure payments with multiple options.",
  },
  {
    icon: Tag,
    title: "Best Offers",
    desc: "Exciting offers and discounts on your favorite products.",
  },
];

const Features = () => {
  return (
    <section className="py-10 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1B4332]/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-[#1B4332]" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-semibold text-[#0F172A] mb-1">
                  {feature.title}
                </h3>
                <p className="font-sans text-xs text-[#64748B] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;