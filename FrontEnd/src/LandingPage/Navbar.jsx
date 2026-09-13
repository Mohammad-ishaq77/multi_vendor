import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, MapPin } from "lucide-react";
import { useTheme } from "../app/providers/ThemeProvider";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";

  const scrollToSection = (id) => {
    if (!isHome) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Home", to: "/", type: "link" },
    { label: "Shops", to: "shops", type: "scroll" },
    { label: "Categories", to: "categories", type: "scroll" },
    { label: "About Us", to: "/about", type: "link" },
    { label: "Contact", to: "/contact", type: "link" },
  ];

  const isActive = (item) => {
    if (item.type === "link") return location.pathname === item.to;
    return false;
  };

  const navbarTheme = isDarkMode
    ? {
        shell: "bg-[#0F172A]/90 text-slate-100 border-b border-slate-700/70 shadow-[0_8px_32px_rgba(15,23,42,0.35)]",
        text: "text-slate-200",
        muted: "text-slate-300",
        chip: "bg-slate-800/80",
        hover: "hover:bg-slate-800 hover:text-white",
        active: "text-white bg-[#1B4332] shadow-md shadow-[#1B4332]/20",
        button: "border-slate-600 text-slate-100 hover:bg-slate-800 hover:border-slate-500",
        mobile: "bg-slate-900/95 border-t border-slate-700",
        mobileItem: "text-slate-300 hover:text-white hover:bg-slate-800",
        mobileActive: "text-white bg-[#1B4332]/20",
        divider: "bg-slate-700",
      }
    : {
        shell: "bg-white/60 text-[#0F172A] border-b border-transparent shadow-none",
        text: "text-[#0F172A]",
        muted: "text-[#64748B]",
        chip: "bg-gray-100/60",
        hover: "hover:bg-white/80 hover:text-[#0F172A]",
        active: "text-white bg-[#1B4332] shadow-md shadow-[#1B4332]/20",
        button: "border-gray-200 text-[#1B4332] hover:border-[#1B4332] hover:bg-[#1B4332]/5",
        mobile: "bg-white/95 border-t border-gray-100",
        mobileItem: "text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50",
        mobileActive: "text-[#1B4332] bg-[#1B4332]/10",
        divider: "bg-gray-200",
      };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md ${navbarTheme.shell} ${
        scrolled ? "shadow-[0_8px_32px_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-[#1B4332] flex items-center justify-center shadow-lg shadow-[#1B4332]/20 group-hover:shadow-[#1B4332]/30 transition-all duration-300 group-hover:scale-105">
              <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold tracking-tight leading-none ${navbarTheme.text}`}>
                NearMart
              </span>
              <span className={`text-[10px] font-medium tracking-widest uppercase mt-0.5 ${navbarTheme.muted}`}>
                Local Stores
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className={`hidden lg:flex items-center gap-1 rounded-full p-1 ${navbarTheme.chip}`}>
            {navLinks.map((item) =>
              item.type === "link" ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                    isActive(item) ? navbarTheme.active : `${navbarTheme.muted} ${navbarTheme.hover}`
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.to)}
                  className={`relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${navbarTheme.muted} ${navbarTheme.hover}`}
                >
                  {item.label}
                </button>
              )
            )}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/cart"
              className={`relative p-2.5 rounded-full transition-all duration-300 ${navbarTheme.muted} ${navbarTheme.hover}`}
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#1B4332] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                2
              </span>
            </Link>

            <div className={`w-px h-6 ${navbarTheme.divider}`} />

            <Link to="/login">
              <button className={`px-5 py-2.5 text-sm font-semibold border rounded-full transition-all duration-300 ${navbarTheme.button}`}>
                Login
              </button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1B4332] rounded-full shadow-lg shadow-[#1B4332]/25 hover:shadow-[#1B4332]/40 hover:bg-[#143728] transition-all duration-300"
              >
                Register
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2.5 rounded-full transition-colors ${isDarkMode ? "text-slate-100 hover:bg-slate-800" : "text-[#0F172A] hover:bg-gray-100"}`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`lg:hidden backdrop-blur-xl overflow-hidden ${isDarkMode ? "bg-slate-900/95 border-t border-slate-700" : "bg-white/95 border-t border-gray-100"}`}
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map((item, idx) =>
                item.type === "link" ? (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                        isActive(item)
                          ? isDarkMode
                            ? "text-white bg-[#1B4332]/20"
                            : "text-[#1B4332] bg-[#1B4332]/10"
                          : isDarkMode
                            ? "text-slate-300 hover:text-white hover:bg-slate-800"
                            : "text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      scrollToSection(item.to);
                      setMobileOpen(false);
                    }}
                    className={`w-full text-left block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      isDarkMode ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </motion.button>
                )
              )}
              <div className={`pt-4 mt-4 border-t flex flex-col gap-3 ${isDarkMode ? "border-slate-700" : "border-gray-100"}`}>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <button className={`w-full px-5 py-3 text-sm font-semibold border rounded-full transition-colors ${
                    isDarkMode ? "border-slate-600 text-slate-100 hover:bg-slate-800" : "border-gray-200 text-[#1B4332] hover:bg-gray-50"
                  }`}>
                    Login
                  </button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <button className="w-full px-5 py-3 text-sm font-semibold text-white bg-[#1B4332] rounded-full">
                    Register
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;