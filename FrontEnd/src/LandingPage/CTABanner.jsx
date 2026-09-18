import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="px-4 py-8 lg:px-8 lg:py-10">
      <div className="container-app relative overflow-hidden shadow-[0_28px_60px_-18px_rgba(0,0,0,0.72)]">
        <img
          src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1600&q=85"
          alt=""
          className="hero-ken-burns absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/68 to-black/48" />
        <div className="relative flex flex-col items-start justify-between gap-5 px-6 py-10 sm:flex-row sm:items-center lg:px-10 lg:py-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">Join the neighborhood</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">Ready to shop local?</h2>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Browse nearby shops now, or list your store and start selling to customers around you.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/marketplace" className="btn-on-green">
              Shop now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-11 items-center gap-2 rounded-[12px] border border-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Store className="h-4 w-4" />
              Sell on NearMart
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
