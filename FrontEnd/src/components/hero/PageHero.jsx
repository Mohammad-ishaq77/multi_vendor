import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Store,
} from "lucide-react";
import MarketplaceSearch from "../common/MarketplaceSearch";
import RotatingHeroTitle from "./RotatingHeroTitle";

const TitleBlock = ({ title, titleMid, highlight, variant, align = "left" }) => {
  const centered = align === "center";

  if (variant === "split") {
    return (
      <h1 className="hero-title-rise font-display text-[clamp(2.7rem,13vw,3.45rem)] font-extrabold leading-[1.06] tracking-tight text-[var(--color-text)] sm:text-[clamp(2.85rem,6.8vw,3.5rem)] lg:text-[3.6rem] lg:font-bold lg:leading-[1.08]">
        <span className="block">{title}</span>
        {titleMid && <span className="block">{titleMid}</span>}
        {highlight && (
          <span className="mt-1 block">
            <span className="hero-word-underline text-[var(--color-primary)]">{highlight}</span>
          </span>
        )}
      </h1>
    );
  }

  if (variant === "mosaic") {
    return (
      <h1 className="hero-title-rise font-display text-[clamp(2.5rem,12vw,3.25rem)] font-extrabold leading-[1.06] tracking-tight text-white sm:text-[clamp(2.65rem,6.4vw,3.3rem)] lg:text-[3.25rem] lg:font-bold lg:leading-[1.1]">
        <span className="block">{title}</span>
        {highlight && <span className="mt-1 block text-[var(--color-green-soft)]">{highlight}</span>}
      </h1>
    );
  }

  return (
    <h1
      className={`hero-title-rise font-display text-[clamp(2.4rem,11.5vw,3.1rem)] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[clamp(2.55rem,6vw,3.2rem)] lg:text-[2.85rem] lg:font-bold lg:leading-[1.12] ${
        centered ? "mx-auto w-full text-center text-balance" : ""
      }`}
    >
      <span className="block">{title}</span>
      {highlight && <span className="mt-1.5 block text-[var(--color-green-soft)]">{highlight}</span>}
    </h1>
  );
};

const ACTION_ICONS = {
  phone: Phone,
  mail: Mail,
  clock: Clock,
  pin: MapPin,
  message: MessageCircle,
  store: Store,
};

const isNearMartOpen = (now = new Date()) => {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (day === 0) return minutes >= 10 * 60 && minutes < 18 * 60;
  return minutes >= 9 * 60 && minutes < 20 * 60;
};

const HoursBadge = () => {
  const open = isNearMartOpen();

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] lg:gap-1.5 lg:px-3 lg:py-1 lg:text-[10px] ${
        open
          ? "border-[var(--color-green-soft)]/40 bg-[var(--color-green)]/25 text-[var(--color-green-soft)]"
          : "border-white/20 bg-white/10 text-white/80"
      }`}
    >
      <span className={`h-1 w-1 rounded-full lg:h-1.5 lg:w-1.5 ${open ? "animate-pulse bg-[var(--color-green-soft)]" : "bg-white/50"}`} />
      {open ? "Open now · till 8 PM" : "Closed · opens 9 AM"}
    </span>
  );
};

const OverlaySearch = ({ placeholder }) => (
  <div className="mt-[max(0.4rem,1vh)] w-full max-w-2xl lg:mt-3">
    <MarketplaceSearch variant="hero" placeholder={placeholder} />
  </div>
);

const Actions = ({ primaryTo, primaryLabel, secondaryTo, secondaryLabel, onGreen, centered, compact }) => {
  if (!primaryTo && !secondaryTo) return null;

  return (
    <div className={`${compact ? "mt-[max(0.5rem,1.2vh)]" : "mt-[max(0.9rem,2.2vh)]"} flex flex-wrap items-center justify-start gap-x-[max(1.1rem,4vw)] gap-y-[max(0.65rem,1.5vh)] lg:mt-3 lg:gap-3 ${centered ? "lg:justify-center" : ""}`}>
      {primaryTo && (
        <Link to={primaryTo} className={`hero-cta ${onGreen ? "btn-on-green" : "btn-primary"}`}>
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
      {secondaryTo && (
        <Link
          to={secondaryTo}
          className={
            onGreen
              ? "hero-cta lg:inline-flex lg:min-h-11 lg:items-center lg:rounded-[12px] lg:border lg:border-white/30 lg:px-5 lg:text-sm lg:font-semibold lg:text-white lg:hover:bg-white/10"
              : /sell|seller/i.test(secondaryLabel)
                ? "hero-cta btn-secondary btn-green-border"
                : "hero-cta btn-secondary"
          }
        >
          {secondaryLabel}
        </Link>
      )}
    </div>
  );
};

const PageHero = ({
  variant = "overlay",
  eyebrow,
  title,
  titleMid,
  highlight,
  titleLine,
  rotating,
  image,
  mosaic = [],
  primaryTo,
  primaryLabel,
  secondaryTo,
  secondaryLabel,
  chips = [],
  searchPlaceholder,
  quickActions = [],
  liveLabel,
  showHours,
}) => {
  if (variant === "ribbon") {
    return (
      <section className="on-green relative overflow-hidden bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)]">
        {image && (
          <img src={image} alt="" className="hero-ken-burns pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20" />
        )}
        <div className="container-app relative flex flex-col items-start justify-end gap-[max(0.95rem,2.4vh)] pt-[max(1rem,2.4vh)] pb-[max(1.6rem,4.2vh)] text-left lg:items-center lg:justify-center lg:gap-5 lg:py-12 lg:text-center">
          <div>
            {eyebrow && (
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80"
              >
                {eyebrow}
              </motion.span>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-[max(0.5rem,1.1vh)] font-display text-[clamp(2.4rem,11.5vw,3.1rem)] font-extrabold text-white sm:text-[clamp(2.55rem,5.8vw,3.2rem)] lg:mt-2 lg:text-4xl lg:font-bold"
            >
              {title} {highlight && <span className="text-[var(--color-green-soft)]">{highlight}</span>}
            </motion.h1>
          </div>
          <Actions
            primaryTo={primaryTo}
            primaryLabel={primaryLabel}
            secondaryTo={secondaryTo}
            secondaryLabel={secondaryLabel}
            onGreen
            centered
          />
        </div>
      </section>
    );
  }

  if (variant === "split") {
    return (
      <section className="hero-shell flex items-end overflow-hidden bg-[var(--color-surface-tint)] lg:items-center">
        <div className="container-app grid h-full items-end gap-[max(0.7rem,1.6vh)] pt-[max(0.9rem,2.2vh)] pb-[max(1.6rem,4.2vh)] lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-5">
          <div>
            {eyebrow && (
              <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="badge-soft">
                {eyebrow}
              </motion.span>
            )}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-3">
              {rotating?.length ? (
                <RotatingHeroTitle titleLine={titleLine} rotating={rotating} />
              ) : (
                <TitleBlock title={title} titleMid={titleMid} highlight={highlight} variant="split" />
              )}
            </motion.div>
            <Actions
              primaryTo={primaryTo}
              primaryLabel={primaryLabel}
              secondaryTo={secondaryTo}
              secondaryLabel={secondaryLabel}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative hidden h-full max-h-[56vh] pt-10 lg:block"
          >
            <div className="card-shine h-full overflow-hidden rounded-xl shadow-[0_30px_60px_-28px_rgba(6,78,59,0.45)]">
              <img src={image} alt="" className="hero-ken-burns h-full min-h-[220px] w-full object-cover sm:min-h-[280px]" />
            </div>
            {mosaic[0] && (
              <motion.img
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                src={mosaic[0]}
                alt=""
                className="absolute -bottom-5 -left-5 hidden h-24 w-32 rounded-lg border-4 border-white object-cover shadow-xl sm:block"
              />
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === "mosaic") {
    const frames = mosaic.length ? mosaic : [image, image, image];

    return (
      <section className="hero-shell on-green relative flex items-end overflow-hidden bg-[var(--color-primary-dark)] lg:items-center">
        <div className="container-app grid h-full items-end gap-[max(0.7rem,1.6vh)] pt-[max(0.9rem,2.2vh)] pb-[max(1.6rem,4.2vh)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-5">
          <div>
            {eyebrow && (
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">{eyebrow}</span>
            )}
            <div className="mt-2">
              <TitleBlock title={title} titleMid={titleMid} highlight={highlight} variant="mosaic" />
            </div>
            <Actions
              primaryTo={primaryTo}
              primaryLabel={primaryLabel}
              secondaryTo={secondaryTo}
              secondaryLabel={secondaryLabel}
              onGreen
            />
          </div>
          <div className="hidden h-full max-h-[56vh] grid-cols-2 gap-3 pt-10 lg:grid">
            <motion.img
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              src={frames[0]}
              alt=""
              className="h-full max-h-[52vh] w-full rounded-xl object-cover"
            />
            <div className="grid gap-3">
              <motion.img
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                src={frames[1] || frames[0]}
                alt=""
                className="h-full max-h-[25vh] w-full rounded-lg object-cover"
              />
              <motion.img
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                src={frames[2] || frames[0]}
                alt=""
                className="h-full max-h-[25vh] w-full rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const rich = Boolean(searchPlaceholder || chips.length || quickActions.length || liveLabel || showHours);

  return (
    <section className="hero-shell hero-overlay on-green relative isolate flex items-end justify-start overflow-hidden lg:items-center lg:justify-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-[12%] h-[124%] w-[124%]"
          animate={{
            x: ["0%", "-5%", "4%", "-2%", "0%"],
            y: ["0%", "-3%", "2%", "3%", "0%"],
            scale: [1, 1.08, 1.04, 1.1, 1],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={image} alt="" className="h-full w-full object-cover object-center" />
        </motion.div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black/25" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.38)_100%)]" />
      <div className={`relative z-10 mx-auto flex w-full justify-start px-[max(1rem,4vw)] lg:justify-center sm:px-6 ${
        rich ? "max-w-6xl pt-[max(0.55rem,1.4vh)] pb-[max(1rem,2.6vh)] lg:py-6" : "max-w-[720px] pt-[max(0.65rem,1.6vh)] pb-[max(1.1rem,2.8vh)] lg:py-8"
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`flex w-full flex-col items-start text-left [text-shadow:0_2px_18px_rgba(0,0,0,0.45)] lg:items-center lg:text-center ${
            rich ? "px-1 py-[max(0.15rem,0.4vh)] sm:px-2" : "px-1 py-[max(0.2rem,0.5vh)]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-start gap-1.5 lg:justify-center lg:gap-2">
            {eyebrow && (
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white/90 lg:px-3.5 lg:py-1 lg:text-[10px] lg:tracking-[0.16em]"
              >
                {eyebrow}
              </motion.span>
            )}
            {liveLabel && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-green-soft)]/40 bg-[var(--color-green)]/25 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--color-green-soft)] lg:gap-1.5 lg:px-3 lg:py-1 lg:text-[10px]">
                <span className="h-1 w-1 animate-pulse rounded-full bg-[var(--color-green-soft)] lg:h-1.5 lg:w-1.5" />
                {liveLabel}
              </span>
            )}
            {showHours && (
              <HoursBadge />
            )}
          </div>

          <h1 className="hero-title-rise mx-0 mt-[max(0.4rem,1vh)] w-full max-w-5xl text-balance text-left font-display text-[clamp(1.5rem,7vw,1.9rem)] font-bold leading-[1.14] tracking-tight text-white sm:text-[clamp(1.7rem,4.6vw,2.15rem)] lg:mx-auto lg:mt-2.5 lg:text-center lg:text-[2.75rem] lg:font-bold lg:leading-[1.12]">
            {title}
          {highlight && (
            <>
              {" "}
              <span className="text-[var(--color-green-soft)]">{highlight}</span>
            </>
          )}
          </h1>

          {searchPlaceholder && <OverlaySearch placeholder={searchPlaceholder} />}

          {chips.length > 0 && (
            <div className="mt-3 hidden w-full max-w-5xl flex-wrap items-center justify-center gap-2 lg:flex">
              {chips.map((chip) => {
                const ChipIcon = ACTION_ICONS[chip.icon] || null;
                const className =
                  "inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-black/35 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-black/50";

                if (chip.href) {
                  return (
                    <motion.a
                      key={chip.label}
                      href={chip.href}
                      whileHover={{ y: -2 }}
                      className={className}
                    >
                      {ChipIcon && <ChipIcon className="h-3.5 w-3.5" />}
                      {chip.label}
                    </motion.a>
                  );
                }

                return (
                  <motion.div key={chip.label} whileHover={{ y: -2 }}>
                    <Link to={chip.to} className={className}>
                      {ChipIcon && <ChipIcon className="h-3.5 w-3.5" />}
                      {chip.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {quickActions.length > 0 && (
            <div className="mt-[max(0.55rem,1.3vh)] flex w-full max-w-5xl flex-wrap items-center justify-start gap-x-[max(0.9rem,3.6vw)] gap-y-[max(0.45rem,1.1vh)] lg:mt-3 lg:justify-center lg:gap-x-6 lg:gap-y-2">
              {quickActions.map((action) => {
                const className = "hero-cta hero-quick-link";
                const inner = (
                  <span>
                    <span className="block text-[clamp(0.92rem,4vw,1.05rem)] font-extrabold lg:text-sm">{action.label}</span>
                    <span className="mt-0.5 block text-[11px] font-semibold opacity-80 lg:text-[12px]">{action.meta}</span>
                  </span>
                );

                if (action.to) {
                  return (
                    <Link key={action.label} to={action.to} className={className}>
                      {inner}
                    </Link>
                  );
                }

                return (
                  <a key={action.label} href={action.href} className={className}>
                    {inner}
                  </a>
                );
              })}
            </div>
          )}

          <Actions
            primaryTo={primaryTo}
            primaryLabel={primaryLabel}
            secondaryTo={secondaryTo}
            secondaryLabel={secondaryLabel}
            onGreen
            centered
            compact
          />
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
