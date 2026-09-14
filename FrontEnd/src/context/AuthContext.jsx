import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import authService, { AUTH_CHANGE_EVENT } from "../services/authService";
import { getDashboardPath } from "../config/roles";

const AuthContext = createContext(null);

const readAuthState = () => ({
  user: authService.getCurrentUser(),
  role: authService.getRole(),
  isAuthenticated: authService.isAuthenticated(),
});

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(readAuthState);

  const refresh = useCallback(() => {
    setState(readAuthState());
  }, []);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(AUTH_CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  const login = useCallback((credentials) => {
    const result = authService.login(credentials);
    if (result.ok) refresh();
    return result;
  }, [refresh]);

  const register = useCallback((payload) => {
    const result = authService.register(payload);
    if (result.ok) refresh();
    return result;
  }, [refresh]);

  const logout = useCallback(() => {
    authService.logout();
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      refresh,
      dashboardPath: state.role ? getDashboardPath(state.role) : "/",
    }),
    [state, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
