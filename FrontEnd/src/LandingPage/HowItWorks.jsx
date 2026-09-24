import { motion } from "framer-motion";
import { MapPin, ShoppingCart, ClipboardCheck, Truck } from "lucide-react";

const steps = [
  { icon: MapPin, title: "Pick a shop", text: "Choose a nearby kirana, boutique or pharmacy you already trust." },
  { icon: ShoppingCart, title: "Add items", text: "Fill your cart from products across your favorite local stores." },
  { icon: ClipboardCheck, title: "Checkout once", text: "Pay a single bill even when your order spans multiple shops." },
  { icon: Truck, title: "Get delivery", text: "A local partner brings everything to your door, same day." },
];

const HowItWorks = () => {
  return (
    <section className="relative isolate overflow-hidden bg-(--color-primary-dark) py-12 lg:py-16">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-28 left-1/2 h-72 w-190 -translate-x-1/2 rounded-full bg-(--color-green)/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-(--color-green-light)/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-(--color-primary)/30 blur-3xl" />

      <div className="container-app relative">
        {/* Header */}
        <div className="mx-auto w-full max-w-5xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-green-soft)"
          >
            How NearMart works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="mt-3 font-display text-3xl font-bold text-white lg:text-4xl"
          >
            Your local market, delivered in four steps
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="mt-3 text-sm leading-relaxed text-white/70 lg:text-base"
          >
            Shop the neighborhood you already know — one cart, one checkout, one doorstep delivery.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative mt-8 lg:mt-10">
          {/* Connector line — only on desktop, hidden behind the cards */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[10%] top-11.75 hidden border-t-2 border-dashed border-white/20 lg:block"
          />
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/6 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 lg:p-6"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-1 right-3 font-display text-6xl font-extrabold leading-none text-white/10 lg:text-7xl"
                >
                  0{index + 1}
                </span>

                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-(--color-green-soft) text-(--color-primary-dark) shadow-[0_10px_22px_-10px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-110">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-green-soft)">
                    Step 0{index + 1}
                  </p>
                </div>

                <h3 className="mt-4 text-base font-bold text-white lg:text-lg">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">{step.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;