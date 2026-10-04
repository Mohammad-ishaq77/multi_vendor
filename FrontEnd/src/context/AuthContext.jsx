/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import authService, { AUTH_CHANGE_EVENT } from "../services/authService";
import tokenService from "../services/tokenService";
import { AUTH_EXPIRED_EVENT, onSessionExpired } from "../services/apiClient";
import { getDashboardPath } from "../config/roles";

const AuthContext = createContext(null);

/**
 * Auth state is owned by the backend.
 *
 * On boot the provider asks the API who the stored tokens belong to
 * (`GET /auth/me`, rotating the refresh token when needed). Nothing is treated
 * as authenticated until the server confirms it, and `status` lets guards show
 * a loader instead of flashing the login page.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | anonymous

  const applyUser = useCallback((nextUser) => {
    setUser(nextUser || null);
    setStatus(nextUser ? "authenticated" : "anonymous");
  }, []);

  const clearSession = useCallback(() => {
    tokenService.clear();
    applyUser(null);
  }, [applyUser]);

  useEffect(() => {
    let active = true;

    (async () => {
      const restored = await authService.restore();
      if (active) applyUser(restored);
    })();

    return () => {
      active = false;
    };
  }, [applyUser]);

  // A failed refresh inside the API client must clear React state too.
  useEffect(() => {
    onSessionExpired(() => {
      setUser((current) => {
        if (current) setStatus("anonymous");
        return null;
      });
    });
  }, []);

  useEffect(() => {
    const onChange = () => {
      if (!tokenService.hasSession()) {
        applyUser(null);
        return;
      }
      authService
        .me()
        .then((fresh) => applyUser(fresh))
        .catch(() => clearSession());
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [applyUser, clearSession]);

  const login = useCallback(
    async (credentials) => {
      const result = await authService.login(credentials);
      if (result.ok) applyUser(result.user);
      return result;
    },
    [applyUser]
  );

  const register = useCallback(
    async (payload) => {
      const result = await authService.register(payload);
      if (result.ok) applyUser(result.user);
      return result;
    },
    [applyUser]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    applyUser(null);
  }, [applyUser]);

  /** Re-read the profile from the API (after a profile update, for example). */
  const reloadUser = useCallback(async () => {
    try {
      const fresh = await authService.me();
      applyUser(fresh);
      return fresh;
    } catch {
      return null;
    }
  }, [applyUser]);

  const value = useMemo(
    () => ({
      user,
      role: user?.activeRole || user?.role || null,
      isAuthenticated: status === "authenticated" && Boolean(user),
      isLoading: status === "loading",
      status,
      login,
      register,
      logout,
      reloadUser,
      dashboardPath: user ? getDashboardPath(user.activeRole || user.role) : "/",
    }),
    [user, status, login, register, logout, reloadUser]
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

export { AUTH_CHANGE_EVENT };
export default AuthContext;