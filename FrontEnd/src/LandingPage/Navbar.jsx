import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Info,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Phone,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";
import MarketplaceSearch from "../components/common/MarketplaceSearch";
import { publicNav } from "../config/navigation";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../features/customer/context/CartContext";
import { getDashboardPath } from "../config/roles";
import { useLogoutConfirm } from "../context/LogoutContext";

const NAV_ICONS = {
  "/": Home,
  "/categories": LayoutGrid,
  "/marketplace": Store,
  "/about": Info,
  "/contact": Phone,
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, dashboardPath } = useAuth();
  const { cartCount } = useCart();
  const { requestLogout } = useLogoutConfirm();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const cartPath = isAuthenticated && user?.role === "customer" ? "/customer/cart" : "/login";
  const accountPath = isAuthenticated ? dashboardPath || getDashboardPath(user?.role) : "/login";

  const isNavActive = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 ${scrolled ? "shadow-[var(--shadow-card)]" : ""}`}>
      <div className="hidden bg-[var(--color-primary-dark)] md:block">
        <div className="container-app flex h-8 items-center justify-between gap-3 sm:h-9">
          <Link to="/" className="flex min-w-0 shrink-0 flex-col leading-none">
            <span className="text-[11px] font-bold tracking-tight text-white sm:text-xs">NearMart</span>
            <span className="mt-px text-[8px] font-medium uppercase tracking-[0.14em] text-white/70">
              Local Marketplace
            </span>
          </Link>
          <nav className="flex min-w-0 items-center justify-end gap-0.5 overflow-x-auto" aria-label="Primary">
            {publicNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-white/85 sm:px-2 sm:text-[11px] ${
                  isNavActive(item.to) ? "bg-white/15 text-white" : "hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-b border-[var(--color-green-soft)] bg-white/95 backdrop-blur-xl">
        <div className="container-app flex h-[60px] items-center gap-3 lg:gap-5">
          <BrandLogo showText={false} size={36} />

          <div className="relative z-[60] hidden min-w-0 flex-1 md:block">
            <MarketplaceSearch />
          </div>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Link
              to={cartPath}
              aria-label="Open cart"
              className="relative rounded-full p-2 text-[var(--color-text)] hover:bg-[var(--color-green-bg)]"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link to={accountPath} className="btn-secondary !min-h-9 !rounded-full !px-4 !text-sm">
                  <LayoutDashboard className="h-4 w-4" />
                  View Dashboard
                </Link>
                <button type="button" className="btn-primary !min-h-9 !rounded-full !px-4 !text-sm" onClick={requestLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !min-h-9 !rounded-full !px-4 !text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary !min-h-9 !rounded-full !px-4 !text-sm">
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <Link to={cartPath} aria-label="Open cart" className="relative rounded-full p-2 text-[var(--color-text)]">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="rounded-full p-2 text-[var(--color-text)] hover:bg-[var(--color-green-bg)]"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-b border-[var(--color-green-soft)] bg-white lg:hidden"
          >
            <div className="container-app space-y-3 py-3">
              <MarketplaceSearch variant="mobile" placeholder="Search marketplace" />

              <nav className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-green-soft)] bg-[var(--color-surface)]" aria-label="Mobile">
                {publicNav.map((item) => {
                  const Icon = NAV_ICONS[item.to] || Store;
                  const active = isNavActive(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      className={`flex items-center gap-3 border-b border-[var(--color-green-soft)] px-4 py-3.5 text-sm font-semibold last:border-b-0 ${
                        active
                          ? "bg-[var(--color-green-bg)] text-[var(--color-primary-dark)]"
                          : "text-[var(--color-text)] hover:bg-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {isAuthenticated ? (
                  <>
                    <Link to={accountPath} className="btn-secondary">View Dashboard</Link>
                    <button type="button" className="btn-primary" onClick={requestLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary">Login</Link>
                    <Link to="/register" className="btn-primary">Register</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
