import { AnimatePresence, motion } from "framer-motion";
import { AlignJustify, X } from "lucide-react";

export const DASHBOARD_INSET = "px-2.5 sm:px-5 lg:px-6";

const DashboardHeader = ({
  title,
  isMenuOpen = false,
  onMenuToggle = () => {},
  children,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 flex h-10 shrink-0 items-center gap-1.5 border-b border-gray-200/80 bg-white sm:h-14 sm:gap-2.5 ${DASHBOARD_INSET}`}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={onMenuToggle}
        className="lg:hidden relative z-50 flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600 sm:h-9 sm:w-9 sm:rounded-lg"
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
              <X className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <AlignJustify className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <h1 className="min-w-0 flex-1 truncate text-xs font-bold tracking-tight text-gray-900 sm:text-[15px] lg:text-base">
        {title}
      </h1>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">{children}</div>
    </header>
  );
};

export default DashboardHeader;
