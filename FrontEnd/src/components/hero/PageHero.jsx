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
      <h1 className="hero-title-rise font-display text-4xl font-bold leading-[1.08] tracking-tight text-[var(--color-text)] sm:text-6xl lg:text-[4.5rem]">
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
      <h1 className="hero-title-rise font-display text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl">
        <span className="block">{title}</span>
        {highlight && <span className="mt-1 block text-[var(--color-green-soft)]">{highlight}</span>}
      </h1>
    );
  }

  return (
    <h1
      className={`hero-title-rise font-display text-[2.15rem] font-bold leading-[1.15] tracking-tight text-white sm:text-[2.75rem] lg:text-[3.25rem] ${
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
        open
          ? "border-[var(--color-green-soft)]/40 bg-[var(--color-green)]/25 text-[var(--color-green-soft)]"
          : "border-white/20 bg-white/10 text-white/80"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${open ? "animate-pulse bg-[var(--color-green-soft)]" : "bg-white/50"}`} />
      {open ? "Open now · till 8 PM" : "Closed · opens 9 AM"}
    </span>
  );
};

const OverlaySearch = ({ placeholder }) => (
  <div className="mt-4 w-full max-w-2xl">
    <MarketplaceSearch variant="hero" placeholder={placeholder} />
  </div>
);

const Actions = ({ primaryTo, primaryLabel, secondaryTo, secondaryLabel, onGreen, centered }) => {
  if (!primaryTo && !secondaryTo) return null;

  return (
    <div className={`mt-4 flex flex-wrap items-center gap-3 ${centered ? "justify-center" : ""}`}>
      {primaryTo && (
        <Link to={primaryTo} className={onGreen ? "btn-on-green" : "btn-primary"}>
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
      {secondaryTo && (
        <Link
          to={secondaryTo}
          className={
            onGreen
              ? "inline-flex min-h-11 items-center rounded-[12px] border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10"
              : /sell|seller/i.test(secondaryLabel)
                ? "btn-secondary btn-green-border"
                : "btn-secondary"
          }
        >
          {secondaryLabel}
        </Link>
      )}
    </div>
  );
};

const Stats = ({ stats, light, centered, plain }) => {
  if (!stats?.length) return null;

  return (
    <div className={`mt-5 grid max-w-3xl grid-cols-3 gap-2 sm:gap-3 ${centered ? "mx-auto w-full" : ""}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl px-3 py-2.5 text-center ${
            light
              ? "border border-[var(--color-green-soft)] bg-white"
              : plain
                ? "border border-white/40 bg-black/30"
                : "border border-white/15 bg-white/10 backdrop-blur-md"
          }`}
        >
          <p className={`font-display text-lg font-bold sm:text-xl ${light ? "text-[var(--color-primary-dark)]" : "text-white"}`}>
            {stat.value}
          </p>
          <p className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wide ${light ? "text-[var(--color-text-muted)]" : "text-white/75"}`}>
            {stat.label}
          </p>
        </div>
      ))}
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
  stats,
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
        <div className="container-app relative flex flex-col items-center justify-center gap-5 py-10 text-center lg:py-12">
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
              className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl"
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
      <section className="overflow-hidden bg-[var(--color-surface-tint)]">
        <div className="container-app grid items-center gap-8 py-10 lg:grid-cols-2 lg:gap-14 lg:py-14">
          <div>
            {eyebrow && (
              <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="badge-soft">
                {eyebrow}
              </motion.span>
            )}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-4">
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
            <Stats stats={stats} light />
          </div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="card-shine overflow-hidden rounded-[28px] shadow-[0_30px_60px_-28px_rgba(6,78,59,0.45)]">
              <img src={image} alt="" className="hero-ken-burns h-[280px] w-full object-cover sm:h-[380px]" />
            </div>
            {mosaic[0] && (
              <motion.img
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                src={mosaic[0]}
                alt=""
                className="absolute -bottom-6 -left-4 hidden h-28 w-36 rounded-2xl border-4 border-white object-cover shadow-xl sm:block"
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
      <section className="on-green relative overflow-hidden bg-[var(--color-primary-dark)]">
        <div className="container-app grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div>
            {eyebrow && (
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">{eyebrow}</span>
            )}
            <div className="mt-3">
              <TitleBlock title={title} titleMid={titleMid} highlight={highlight} variant="mosaic" />
            </div>
            <Actions
              primaryTo={primaryTo}
              primaryLabel={primaryLabel}
              secondaryTo={secondaryTo}
              secondaryLabel={secondaryLabel}
              onGreen
            />
            <Stats stats={stats} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <motion.img
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              src={frames[0]}
              alt=""
              className="h-56 w-full rounded-[24px] object-cover sm:h-72"
            />
            <div className="grid gap-3">
              <motion.img
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                src={frames[1] || frames[0]}
                alt=""
                className="h-[7.25rem] w-full rounded-[20px] object-cover sm:h-32"
              />
              <motion.img
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                src={frames[2] || frames[0]}
                alt=""
                className="h-[7.25rem] w-full rounded-[20px] object-cover sm:h-36"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const rich = Boolean(searchPlaceholder || chips.length || quickActions.length || liveLabel || showHours);

  return (
    <section className={`on-green relative isolate flex items-center justify-center overflow-hidden ${
      rich ? "min-h-[320px] sm:min-h-[360px] lg:min-h-[380px]" : "min-h-[420px] sm:min-h-[500px] lg:min-h-[540px]"
    }`}>
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
      <div className={`relative z-10 mx-auto flex w-full justify-center px-4 sm:px-6 ${
        rich ? "max-w-6xl py-8 lg:py-10" : "max-w-[720px] py-16 lg:py-20"
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`flex w-full flex-col items-center text-center [text-shadow:0_2px_18px_rgba(0,0,0,0.45)] ${
            rich ? "px-1 py-4 sm:px-2" : "px-1 py-6"
          }`}
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            {eyebrow && (
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90"
              >
                {eyebrow}
              </motion.span>
            )}
            {liveLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-green-soft)]/40 bg-[var(--color-green)]/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-green-soft)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-green-soft)]" />
                {liveLabel}
              </span>
            )}
            {showHours && (
              <HoursBadge />
            )}
          </div>

          <h1 className="hero-title-rise mx-auto mt-3 w-full max-w-5xl text-balance text-center font-display text-[1.75rem] font-bold leading-[1.15] tracking-tight text-white sm:text-[2.15rem] lg:text-[2.55rem]">
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
            <div className="mt-4 flex w-full max-w-5xl flex-wrap items-center justify-center gap-2">
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
            <div className="mt-4 grid w-full max-w-5xl gap-2 sm:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = ACTION_ICONS[action.icon] || Mail;
                const className =
                  "group flex items-center gap-3 rounded-2xl border border-white/50 bg-black/35 px-4 py-3 text-left hover:bg-black/50";
                const inner = (
                  <>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/12 text-[var(--color-green-soft)] group-hover:bg-white/20">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{action.label}</span>
                      <span className="block text-[11px] text-white/70">{action.meta}</span>
                    </span>
                  </>
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
          />
          <Stats stats={stats} centered plain />
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
