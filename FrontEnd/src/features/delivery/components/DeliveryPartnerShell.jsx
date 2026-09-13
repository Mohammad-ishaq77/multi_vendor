import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import DeliverySidebar from "./DeliverySidebar";
import DeliveryTopbar from "./DeliveryTopbar";

const DeliveryPartnerShell = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#f7faf8] font-sans selection:bg-[#155c43]/20 selection:text-[#155c43]">
      <DeliverySidebar isMobileOpen={mobileMenuOpen} onMobileClose={closeMobileMenu} />

      <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
        <DeliveryTopbar
          isMenuOpen={mobileMenuOpen}
          onMenuToggle={() => setMobileMenuOpen((v) => !v)}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.3 } }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DeliveryPartnerShell;
