import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ShoppingCart, ClipboardCheck, Truck } from "lucide-react";

const steps = [
  { icon: MapPin, title: "Pick a shop", text: "Choose a nearby kirana, boutique or pharmacy." },
  { icon: ShoppingCart, title: "Add items", text: "Fill your cart from products you already buy." },
  { icon: ClipboardCheck, title: "Checkout", text: "Pay once — even across your favorite stores." },
  { icon: Truck, title: "Get delivery", text: "A local partner brings the order to your door." },
];

const HowItWorks = () => {
  return (
    <section className="bg-[var(--color-surface-tint)] py-10 lg:py-14">
      <div className="container-app">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">Four simple steps</p>
            <h2 className="mt-1 font-display text-2xl font-bold lg:text-3xl">How it works</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-semibold text-[var(--color-primary)]">
            Start shopping
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="card-surface flex gap-3 p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                <step.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">0{index + 1}</p>
                <h3 className="text-sm font-bold">{step.title}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-muted)]">{step.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
