import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import CustomerTopbar from "./CustomerTopbar";
import { useCart } from "../context/CartContext";
import { DASHBOARD_INSET } from "../../../components/dashboard/DashboardHeader";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

const CustomerShell = ({ children }) => {
  const { cartCount } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-[#f7faf8] font-sans selection:bg-[#155c43]/20 selection:text-[#155c43]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <motion.div
          animate={{ opacity: [0.03, 0.06, 0.03], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-[#155c43] blur-[150px]"
        />
      </div>

      <CustomerSidebar isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <CustomerTopbar
          cartCount={cartCount}
          isMenuOpen={mobileMenuOpen}
          onMenuToggle={() => setMobileMenuOpen((isOpen) => !isOpen)}
        />

        <main className={`${DASHBOARD_INSET} flex-1 overflow-x-hidden overflow-y-auto scroll-smooth py-5 pb-24 lg:py-6 lg:pb-8`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default CustomerShell;
