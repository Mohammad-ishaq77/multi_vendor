import { AnimatePresence, motion } from "framer-motion";
import { AlignJustify, X } from "lucide-react";

export const DASHBOARD_INSET = "px-4 sm:px-5 lg:px-6";

const DashboardHeader = ({
  title,
  isMenuOpen = false,
  onMenuToggle = () => {},
  children,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2.5 border-b border-gray-200/80 bg-white ${DASHBOARD_INSET}`}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={onMenuToggle}
        className="lg:hidden relative z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
      >
        <AnimatePresence mode="wait">
          {isMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <AlignJustify className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold tracking-tight text-gray-900 sm:text-base">
        {title}
      </h1>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">{children}</div>
    </header>
  );
};

export default DashboardHeader;
