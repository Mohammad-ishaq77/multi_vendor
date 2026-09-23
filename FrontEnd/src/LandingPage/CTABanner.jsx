import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="cta-banner py-6 lg:py-8">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-(--color-primary-dark) shadow-[0_20px_46px_-28px_rgba(6,78,59,0.7)]">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/10 bg-white/5" />
          <div className="pointer-events-none absolute bottom-0 right-20 h-24 w-80 rounded-t-full border border-white/10 bg-white/5" />
          <div className="relative flex flex-col items-start justify-between gap-5 px-6 py-8 sm:flex-row sm:items-center lg:px-10 lg:py-9">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">Join the neighborhood</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">Ready to shop local?</h2>
              <p className="mt-2 max-w-md text-sm text-white/80">
                Browse nearby shops now, or list your store and start selling to customers around you.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-[max(1.1rem,4vw)] gap-y-[max(0.65rem,1.5vh)] lg:gap-2">
              <Link to="/marketplace" className="hero-cta btn-on-green">
                Shop now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register?role=shopkeeper"
                className="hero-cta lg:inline-flex lg:min-h-11 lg:items-center lg:gap-2 lg:rounded-xl lg:border lg:border-(--color-primary) lg:px-5 lg:text-sm lg:font-semibold lg:text-white lg:hover:bg-white/10"
              >
                <Store className="h-4 w-4" />
                Sell on NearMart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
