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
      // A pending registration deliberately has no user: the account only
      // becomes a session after the email OTP is verified.
      if (result.ok && result.user) applyUser(result.user);
      return result;
    },
    [applyUser]
  );

  /**
   * Confirm the emailed registration OTP and adopt the returned session.
   * The context is the only place React auth state is written, so this lives
   * next to login/register instead of the page calling the service directly.
   */
  const verifyEmail = useCallback(
    async (payload) => {
      const result = await authService.verifyEmail(payload);
      if (result.ok) applyUser(result.user);
      return result;
    },
    [applyUser]
  );

  /** Re-send the registration OTP. Pure pass-through — no auth state changes. */
  const resendVerification = useCallback(async (payload) => {
    const result = await authService.resendVerification(payload);
    return result;
  }, []);

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
      verifyEmail,
      resendVerification,
      logout,
      reloadUser,
      dashboardPath: user ? getDashboardPath(user.activeRole || user.role) : "/",
    }),
    [user, status, login, register, verifyEmail, resendVerification, logout, reloadUser]
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