import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles, Store, Truck } from "lucide-react";
import { homeHero, homeFloatCards } from "../config/heroes";
import { APP_CONFIG } from "../config/appConfig";
import RotatingHeroTitle from "../components/hero/RotatingHeroTitle";

const Hero = ({
  tone = "light",
  eyebrow = homeHero.eyebrow,
  titleLine = homeHero.titleLine,
  rotating = homeHero.rotating,
  slides = homeHero.slides || [],
  primaryTo = "/marketplace",
  primaryLabel = "Shop nearby",
  secondaryTo = "/register?role=shopkeeper",
  secondaryLabel = "Sell on NearMart",
  footer,
  compactHome = false,
  leftAligned = false,
  sectionClassName = "",
}) => {
  const dark = tone === "dark";
  const [slideIndex, setSlideIndex] = useState(0);

  const currentSlide = slides[slideIndex] || { image: homeHero.image };

  return (
    <section
      className={`hero-shell relative flex items-end lg:items-center ${sectionClassName} ${
        compactHome ? "compact-home-hero on-green overflow-hidden relative" : dark ? "on-green bg-(--color-primary-dark) relative overflow-hidden" : "bg-(--color-surface-tint) relative overflow-hidden"
      }`}
    >
      {/* Dynamic Background Image Slideshow synchronized with rotating title — seamless cross-fade */}
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
        {slides.map((slide, idx) => (
          <motion.div
            key={slide.image}
            initial={{ opacity: 0 }}
            animate={{ opacity: idx === slideIndex ? 0.72 : 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <img
              src={slide.image}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {compactHome && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          {/* Top-right corner — orbiting rings */}
          <div className="hero-corner-orbit absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/5">
            <span className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
          </div>
          <div className="hero-corner-orbit hero-corner-orbit--reverse absolute -right-9 -top-9 h-36 w-36 rounded-full border border-white/5">
            <Sparkles className="absolute -left-1.5 bottom-1 h-5 w-5 text-white/40" />
          </div>

          {/* Left-bottom corner — subtle dark breathing glow */}
          <div className="hero-corner-breathe absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_68%)] blur-xl" />
        </div>
      )}
      <div className="container-app relative h-full z-10">
        <div className={`grid h-full items-end gap-[max(0.7rem,1.6vh)] pt-[max(0.9rem,2.2vh)] pb-[max(1.6rem,4.2vh)] lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8 lg:py-5 ${compactHome ? "compact-hero-content" : ""}`}>
          <div className={`relative z-10 w-full ${leftAligned ? "text-left" : "text-center"} lg:w-full ${dark || compactHome ? "text-white" : ""}`}>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                dark || compactHome
                  ? "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-[max(0.7rem,2.6vw)] py-[max(0.28rem,0.65vh)] text-[clamp(9px,2.6vw,11px)] font-bold uppercase tracking-[0.14em] text-white lg:px-3 lg:py-1 lg:text-[10px]"
                  : "badge-soft"
              }
            >
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </motion.span>

            <RotatingHeroTitle
              titleLine={titleLine}
              rotating={rotating}
              dark={dark || compactHome}
              centered={compactHome}
              currentIndex={slideIndex}
              onIndexChange={setSlideIndex}
              intervalMs={4500}
            />

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className={`hero-cta-row mt-[max(1.1rem,2.6vh)] flex flex-row flex-wrap items-center gap-x-[max(0.8rem,3vw)] gap-y-[max(0.5rem,1.2vh)] lg:mt-5 lg:gap-3 ${leftAligned ? "justify-start" : "justify-center"}`}
            >
              <Link to={primaryTo} className={`hero-cta ${dark || compactHome ? "btn-on-green" : "btn-primary"} !px-4 !py-2 !min-h-9 !text-xs sm:!text-sm`}>
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={secondaryTo}
                className={
                  dark || compactHome
                    ? "hero-cta inline-flex min-h-9 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-xs hover:bg-white/20 transition-all"
                    : "hero-cta btn-secondary btn-green-border !px-4 !py-2 !min-h-9 !text-xs sm:!text-sm"
                }
              >
                {secondaryLabel}
              </Link>
            </motion.div>

            {footer && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className={`mt-3 inline-flex items-center gap-2 text-xs font-medium ${dark || compactHome ? "text-white/70" : "text-(--color-text-muted)"}`}
              >
                <MapPin className={`h-3.5 w-3.5 ${dark || compactHome ? "text-(--color-green-soft)" : "text-(--color-primary)"}`} />
                {footer}
              </motion.p>
            )}
          </div>

          {!compactHome && <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="relative hidden h-full w-full items-start justify-end pt-16 lg:flex"
          >
            <div className="relative w-fit px-12 py-5">
              <div
                className={`pointer-events-none absolute bottom-5 left-1/2 z-1 h-14 w-[88%] -translate-x-1/2 rounded-[100%] ${
                  dark
                    ? "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.32)_0%,rgba(167,243,208,0.18)_38%,transparent_72%)]"
                    : "bg-[radial-gradient(ellipse_at_center,rgba(15,81,50,0.28)_0%,rgba(46,125,50,0.14)_42%,transparent_74%)]"
                }`}
              />
              <div
                className={`pointer-events-none absolute bottom-2 left-1/2 z-0 h-24 w-[72%] -translate-x-1/2 rounded-[100%] blur-2xl ${
                  dark ? "bg-(--color-green-soft)/30" : "bg-(--color-green)/22"
                }`}
              />
              {homeFloatCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.12 }}
                  className={`hero-float absolute z-20 overflow-hidden rounded-2xl border bg-white shadow-[0_16px_32px_-18px_rgba(6,78,59,0.4)] ${
                    dark ? "border-white/40" : "border-white/80"
                  } ${
                    index === 0
                      ? "left-0 top-1 w-37"
                      : index === 1
                        ? "right-0 top-11 w-34"
                        : "left-0 bottom-2 w-37"
                  }`}
                  style={{ animationDelay: `${index * 0.6}s` }}
                >
                  <div className={`overflow-hidden ${index === 1 ? "h-17" : "h-18.5"}`}>
                    <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-[11px] font-semibold leading-tight text-(--color-text)">{card.title}</p>
                    <p className="mt-0.5 text-[10px] text-(--color-text-muted)">{card.meta}</p>
                  </div>
                </motion.article>
              ))}

              <img
                src={APP_CONFIG.heroImage}
                alt="NearMart local marketplace"
                className="relative z-10 h-auto max-h-[48vh] w-full max-w-75 object-contain drop-shadow-2xl lg:max-w-85"
              />

              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute bottom-6 right-0 z-20 flex items-center gap-2 rounded-full border border-white/80 bg-white px-2.5 py-1.5 shadow-[0_12px_24px_-12px_rgba(6,78,59,0.35)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-(--color-green-bg) text-(--color-primary)">
                  <Truck className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold leading-tight text-(--color-text)">Out for delivery</p>
                  <p className="text-[10px] text-(--color-text-muted)">Fresh Basket · 8 min</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute left-0 top-[42%] z-20 flex items-center gap-2 rounded-full border border-white/80 bg-white px-2.5 py-1.5 shadow-[0_12px_24px_-12px_rgba(6,78,59,0.35)]"
              >
                <Store className="h-3.5 w-3.5 text-(--color-primary)" />
                <p className="text-[11px] font-semibold text-(--color-text)">50+ shops live</p>
              </motion.div>
            </div>
          </motion.div>}
        </div>
      </div>
    </section>
  );
};

export default Hero;
