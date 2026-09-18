import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";

const LogoutConfirmModal = ({ open, onCancel, onConfirm }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#042F2E]/45 backdrop-blur-sm"
            aria-label="Close logout confirmation"
            onClick={onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="relative w-full max-w-md rounded-2xl border border-[var(--color-green-soft)] bg-white p-6 shadow-[var(--shadow-hover)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-green-bg)] text-[var(--color-primary)]">
              <LogOut className="h-5 w-5" />
            </div>
            <h2 id="logout-title" className="mt-4 text-xl font-bold text-[var(--color-text)]">
              Are you sure you want to log out?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              You will need to log in again to access and edit your dashboard.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="min-h-11 rounded-xl border border-[var(--color-green-soft)] bg-white px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-green-bg)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="min-h-11 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)]"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirmModal;
