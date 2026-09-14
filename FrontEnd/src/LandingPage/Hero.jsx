import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles, Store, Truck } from "lucide-react";
import { APP_CONFIG } from "../config/appConfig";
import { homeFloatCards, homeHero } from "../config/heroes";

const Hero = ({
  tone = "light",
  eyebrow = homeHero.eyebrow,
  titleLine = "Your local marketplace,",
  rotating = homeHero.rotating,
  description = homeHero.description,
  stats = homeHero.stats,
  primaryTo = "/marketplace",
  primaryLabel = "Shop nearby",
  secondaryTo = "/register",
  secondaryLabel = "Sell on NearMart",
  footer = "Serving Srinagar neighborhoods · kiranas, boutiques & pharmacies",
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const dark = tone === "dark";

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((current) => (current + 1) % rotating.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [rotating.length]);

  return (
    <section className={`relative overflow-hidden ${dark ? "on-green bg-[var(--color-primary-dark)]" : "bg-[var(--color-surface-tint)]"}`}>
      {!dark && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={homeHero.image}
            alt=""
            className="hero-ken-burns h-full w-full object-cover opacity-[0.14]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-surface-tint)] via-[var(--color-surface-tint)]/92 to-white" />
        </div>
      )}

      <div className="container-app relative">
        <div className="grid items-start gap-10 pb-12 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:pb-16 lg:pt-8">
          <div className={`relative z-10 text-center lg:text-left ${dark ? "text-white" : ""}`}>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                dark
                  ? "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
                  : "badge-soft"
              }
            >
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </motion.span>

            <h1
              className={`mt-5 font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.35rem] ${
                dark ? "text-white" : "text-[var(--color-text)]"
              }`}
            >
              <span className="block">{titleLine}</span>
              <span className="relative mt-1 block h-[1.15em] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotating[wordIndex]}
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-110%", opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={`absolute inset-x-0 top-0 ${dark ? "text-[var(--color-green-soft)]" : "text-[var(--color-primary)]"}`}
                  >
                    {rotating[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className={`mx-auto mt-5 max-w-xl text-sm leading-relaxed sm:text-base lg:mx-0 ${
                dark ? "text-white/80" : "text-[var(--color-text-muted)]"
              }`}
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link to={primaryTo} className={dark ? "btn-on-green w-full sm:w-auto" : "btn-primary w-full sm:w-auto"}>
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={secondaryTo}
                className={
                  dark
                    ? "inline-flex min-h-11 w-full items-center justify-center rounded-[12px] border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10 sm:w-auto"
                    : "btn-secondary w-full sm:w-auto"
                }
              >
                {secondaryLabel}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
              className="mt-8 grid grid-cols-3 gap-2 sm:max-w-lg sm:gap-3 lg:max-w-none"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl px-3 py-3 text-center sm:px-4 ${
                    dark
                      ? "border border-white/15 bg-white/10 backdrop-blur-sm"
                      : "border border-[var(--color-green-soft)] bg-white/80 backdrop-blur-sm"
                  }`}
                >
                  <p className={`font-display text-lg font-bold sm:text-xl ${dark ? "text-white" : "text-[var(--color-primary-dark)]"}`}>
                    {stat.value}
                  </p>
                  <p className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wide sm:text-[11px] ${dark ? "text-white/70" : "text-[var(--color-text-muted)]"}`}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {footer && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className={`mt-5 inline-flex items-center gap-2 text-xs font-medium ${dark ? "text-white/70" : "text-[var(--color-text-muted)]"}`}
              >
                <MapPin className={`h-3.5 w-3.5 ${dark ? "text-[var(--color-green-soft)]" : "text-[var(--color-primary)]"}`} />
                {footer}
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="relative mx-auto flex min-h-[420px] w-full max-w-[540px] items-center justify-center lg:max-w-none"
          >
            <div className={`absolute h-64 w-64 rounded-full blur-3xl sm:h-80 sm:w-80 ${dark ? "bg-[var(--color-green)]/25" : "bg-[var(--color-green-light)]/20"}`} />

            {homeFloatCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.12 }}
                className={`hero-float absolute z-20 hidden w-[148px] overflow-hidden rounded-2xl border bg-white shadow-[0_18px_40px_-20px_rgba(6,78,59,0.45)] sm:block ${
                  dark ? "border-white/40" : "border-white/70"
                } ${
                  index === 0
                    ? "left-0 top-8"
                    : index === 1
                      ? "right-0 top-16"
                      : "bottom-8 left-4"
                }`}
                style={{ animationDelay: `${index * 0.6}s` }}
              >
                <div className="h-20 overflow-hidden">
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] font-bold text-[var(--color-text)]">{card.title}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{card.meta}</p>
                </div>
              </motion.article>
            ))}

            <img
              src={APP_CONFIG.heroImage}
              alt="NearMart local marketplace"
              className="relative z-10 h-auto w-full max-w-[280px] object-contain drop-shadow-2xl sm:max-w-[340px] lg:max-w-[400px]"
            />

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-6 right-2 z-20 hidden items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-3 py-2 shadow-lg sm:flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-green-bg)] text-[var(--color-primary)]">
                <Truck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-bold text-[var(--color-text)]">Out for delivery</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Fresh Basket · 8 min</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute left-8 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-3 py-2 shadow-lg md:flex"
            >
              <Store className="h-4 w-4 text-[var(--color-primary)]" />
              <p className="text-[11px] font-bold text-[var(--color-text)]">50+ shops live</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
