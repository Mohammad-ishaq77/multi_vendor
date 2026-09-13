import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import CustomerTopbar from "./CustomerTopbar";
import { useCart } from "../context/CartContext";

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.98,
    transition: { duration: 0.3 }
  }
};

const CustomerShell = ({ children }) => {
  const { cartCount } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f7faf8] flex font-sans selection:bg-[#155c43]/20 selection:text-[#155c43] overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ opacity: [0.03, 0.06, 0.03], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[#155c43] rounded-full blur-[150px]"
        />
      </div>

      <CustomerSidebar isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth">
        <div className="p-5 md:p-8 lg:p-10 min-h-screen">
          <CustomerTopbar
            cartCount={cartCount}
            isMenuOpen={mobileMenuOpen}
            onMenuToggle={() => setMobileMenuOpen((isOpen) => !isOpen)}
          />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default CustomerShell;