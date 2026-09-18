import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import DeliverySidebar from "./DeliverySidebar";
import DeliveryTopbar from "./DeliveryTopbar";
import { DASHBOARD_INSET } from "../../../components/dashboard/DashboardHeader";

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
    <div className="flex h-screen min-h-screen overflow-hidden bg-[#f7faf8] font-sans selection:bg-[#155c43]/20 selection:text-[#155c43]">
      <DeliverySidebar isMobileOpen={mobileMenuOpen} onMobileClose={closeMobileMenu} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <DeliveryTopbar
          isMenuOpen={mobileMenuOpen}
          onMenuToggle={() => setMobileMenuOpen((v) => !v)}
        />

        <main className={`${DASHBOARD_INSET} flex-1 overflow-x-hidden overflow-y-auto py-2 pb-12 sm:py-5 sm:pb-24 lg:py-6 lg:pb-8`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
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

export default DeliveryPartnerShell;
