import { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutConfirmModal from "../components/common/LogoutConfirmModal";
import authService from "../services/authService";

const LogoutContext = createContext(null);

export const LogoutProvider = ({ children }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const requestLogout = useCallback(() => setOpen(true), []);
  const cancelLogout = useCallback(() => setOpen(false), []);
  const confirmLogout = useCallback(() => {
    setOpen(false);
    navigate("/", { replace: true });
    authService.logout();
  }, [navigate]);

  return (
    <LogoutContext.Provider value={{ requestLogout }}>
      {children}
      <LogoutConfirmModal open={open} onCancel={cancelLogout} onConfirm={confirmLogout} />
    </LogoutContext.Provider>
  );
};

export const useLogoutConfirm = () => {
  const context = useContext(LogoutContext);
  if (!context) {
    throw new Error("useLogoutConfirm must be used within LogoutProvider");
  }
  return context;
};

export default LogoutContext;
