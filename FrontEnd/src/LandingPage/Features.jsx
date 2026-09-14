import { motion } from "framer-motion";
import { ShieldCheck, Store, Tag, Truck } from "lucide-react";

const features = [
  { icon: Store, title: "Local shops", text: "Kiranas, boutiques and pharmacies you already know." },
  { icon: Truck, title: "Fast delivery", text: "Same-day drops across Srinagar neighborhoods." },
  { icon: ShieldCheck, title: "Secure pay", text: "Checkout once, with trusted payment options." },
  { icon: Tag, title: "Fair prices", text: "Compare nearby sellers before you buy." },
];

const Features = () => {
  return (
    <section className="border-y border-[var(--color-green-soft)] bg-white py-6 lg:py-8">
      <div className="container-app grid grid-cols-2 gap-3 lg:grid-cols-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 rounded-2xl bg-[var(--color-green-bg)] px-4 py-4"
          >
            <feature.icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
            <div>
              <h3 className="text-sm font-bold">{feature.title}</h3>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-muted)]">{feature.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
