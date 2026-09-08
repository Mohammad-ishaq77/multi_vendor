import { useState, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm max-w-sm ${
                toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" :
                "bg-amber-50 border-amber-200 text-amber-800"
              }`}>
                {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />}
                <p className="text-sm font-medium">{toast.message}</p>
                <button onClick={() => removeToast(toast.id)} className="ml-2 shrink-0 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
