import apiClient, { ApiError } from "./apiClient";
import tokenService from "./tokenService";
import { getDashboardPath, getRoleMeta, isValidRole } from "../config/roles";

/**
 * Real authentication against the NearMart API.
 *
 * Flow:  login/register -> { accessToken, refreshToken, user }
 *        API client attaches the access token and rotates it on 401
 *        logout revokes the refresh token server-side, then clears local state
 *
 * There is no demo account, no hardcoded credential and no simulated latency.
 */

const AUTH_EVENT = "nearmart-auth-change";

const emitAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
};

export const AUTH_CHANGE_EVENT = AUTH_EVENT;

const friendlyError = (error, fallback) => {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return error.status === 403
        ? error.message
        : "Invalid email or password. Please try again.";
    }
    if (error.isNetworkError) return error.message;
    if (error.isValidationError) {
      const detail = error.issues?.map((i) => i.message).filter(Boolean).join(" ");
      return detail || error.message;
    }
    return error.message;
  }
  return fallback;
};

/** Attach the display metadata the UI expects without faking identity. */
export const decorateUser = (user) => {
  if (!user) return null;
  const role = user.activeRole || user.role;
  const meta = getRoleMeta(role);
  return {
    ...user,
    role,
    roleLabel: meta.label,
    avatar: user.avatarUrl || null,
  };
};

const storeSession = ({ user, accessToken, refreshToken }) => {
  tokenService.setTokens({ accessToken, refreshToken });
  const decorated = decorateUser(user);
  tokenService.setActiveRole(decorated?.activeRole || decorated?.role);
  emitAuthChange();
  return decorated;
};

/**
 * Email verification is a first-class state, not an error string: when the
 * backend refuses a login because the address is unverified, the caller needs
 * the email to route the user to the verification screen.
 */
const EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";

export const authService = {
  /**
   * Sign in. Returns `{ ok, user, error }` — `ok` is true only when the
   * backend accepted the credentials and the session is live.
   */
  async login({ email, password, role, remember = true } = {}) {
    if (!email?.trim() || !password) {
      return { ok: false, error: "Please enter your email and password." };
    }

    if (role !== undefined && role !== null && !isValidRole(role)) {
      return { ok: false, error: "Please select a valid role to continue." };
    }

    try {
      const session = await apiClient.post(
        "/auth/login",
        {
          email: email.trim(),
          password,
          ...(role ? { role } : {}),
        },
        { auth: false, retry: false }
      );

      const user = storeSession(session);
      return {
        ok: true,
        user,
        remember,
        redirectTo: this.getPostAuthPath(user),
      };
    } catch (error) {
      if (error instanceof ApiError && error.code === EMAIL_NOT_VERIFIED) {
        return {
          ok: false,
          error: error.message || "Please verify your email address before signing in.",
          needsVerification: true,
          email: email.trim(),
        };
      }
      return { ok: false, error: friendlyError(error, "Unable to sign in right now.") };
    }
  },

  /**
   * Create an account. The backend emails a verification OTP and does NOT
   * return a session — the caller must route the user to /verify-email.
   */
  async register({ name, email, password, phone, role, remember = true } = {}) {
    if (!name?.trim() || !email?.trim() || !password) {
      return { ok: false, error: "Please complete all required fields." };
    }

    if (!isValidRole(role)) {
      return { ok: false, error: "Please select a valid role." };
    }

    if (String(password).length < 4) {
      return { ok: false, error: "Password must be at least 4 characters long." };
    }

    const trimmedEmail = email.trim();

    try {
      const result = await apiClient.post(
        "/auth/register",
        {
          name: name.trim(),
          email: trimmedEmail,
          password,
          role,
          ...(phone?.trim() ? { phone: phone.trim() } : {}),
        },
        { auth: false, retry: false }
      );

      // No tokenService writes: an unverified account has no session yet.
      return {
        ok: true,
        pending: true,
        remember,
        email: result?.email || trimmedEmail,
        role: result?.role || role,
      };
    } catch (error) {
      return {
        ok: false,
        error: friendlyError(error, "Unable to create your account right now."),
      };
    }
  },

  /** Confirm a registration OTP and start the session. */
  async verifyEmail({ email, otp } = {}) {
    if (!email?.trim() || !otp) {
      return { ok: false, error: "Enter the 6-digit code from your email." };
    }

    try {
      const session = await apiClient.post(
        "/auth/verify-email",
        { email: email.trim(), otp },
        { auth: false, retry: false }
      );
      const user = storeSession(session);
      return { ok: true, user, redirectTo: this.getPostAuthPath(user) };
    } catch (error) {
      return { ok: false, error: friendlyError(error, "That code could not be verified.") };
    }
  },

  /** Ask for another verification code. Generic on the server; keep it silent. */
  async resendVerification({ email } = {}) {
    if (!email?.trim()) return { ok: false, error: "Enter your email address first." };
    try {
      await apiClient.post("/auth/resend-verification", { email: email.trim() }, { auth: false, retry: false });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: friendlyError(error, "We could not send a new code right now.") };
    }
  },

  /**
   * Start a password reset. The backend answers identically for known and
   * unknown emails, so this never confirms whether an account exists.
   */
  async forgotPassword({ email } = {}) {
    if (!email?.trim()) return { ok: false, error: "Enter your email address." };
    try {
      await apiClient.post("/auth/forgot-password", { email: email.trim() }, { auth: false, retry: false });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: friendlyError(error, "We could not send the reset code right now.") };
    }
  },

  /** Swap a password-reset OTP for a single-use reset token. */
  async verifyResetOtp({ email, otp } = {}) {
    if (!email?.trim() || !otp) return { ok: false, error: "Enter the 6-digit code from your email." };
    try {
      const result = await apiClient.post(
        "/auth/verify-reset-otp",
        { email: email.trim(), otp },
        { auth: false, retry: false }
      );
      return {
        ok: true,
        resetToken: result?.resetToken || result?.token,
        expiresInMinutes: result?.expiresInMinutes,
      };
    } catch (error) {
      return { ok: false, error: friendlyError(error, "That code could not be verified.") };
    }
  },

  /** Set the new password using the reset token. */
  async resetPassword({ email, resetToken, newPassword } = {}) {
    if (!email?.trim() || !resetToken) {
      return { ok: false, error: "This password reset link is invalid or has expired." };
    }
    if (String(newPassword || "").length < 4) {
      return { ok: false, error: "Password must be at least 4 characters long." };
    }
    try {
      await apiClient.post(
        "/auth/reset-password",
        { email: email.trim(), resetToken, newPassword },
        { auth: false, retry: false }
      );
      // Any previously stored token belonged to the old password's session.
      tokenService.clear();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: friendlyError(error, "Unable to update your password right now.") };
    }
  },

  /** Current user straight from the API (source of truth for the session). */
  async me() {
    const user = await apiClient.get("/auth/me");
    return decorateUser(user?.user || user);
  },

  /**
   * Restore a session on app boot. Uses the stored refresh token when the
   * access token is gone or expired. Returns the user or null.
   */
  async restore() {
    if (!tokenService.hasSession()) return null;
    try {
      if (!tokenService.getAccessToken()) {
        await apiClient.post(
          "/auth/refresh",
          {
            refreshToken: tokenService.getRefreshToken(),
            ...(tokenService.getActiveRole() ? { role: tokenService.getActiveRole() } : {}),
          },
          { auth: false, retry: false }
        ).then((session) => {
          tokenService.setTokens({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
          });
          if (session.user?.activeRole) tokenService.setActiveRole(session.user.activeRole);
        });
      }
      return await this.me();
    } catch {
      tokenService.clear();
      return null;
    }
  },

  async logout() {
    const refreshToken = tokenService.getRefreshToken();
    tokenService.clear();
    emitAuthChange();
    if (!refreshToken) return { ok: true };
    try {
      await apiClient.post("/auth/logout", { refreshToken }, { auth: false, retry: false });
      return { ok: true };
    } catch {
      // The local session is already gone; a failed revoke is not user-facing.
      return { ok: true };
    }
  },

  /**
   * Where to send a freshly authenticated user.
   *
   * Onboarding gating is intentionally not duplicated here: the shopkeeper and
   * delivery Entry routes already redirect to onboarding using live backend
   * data, so this returns the role's dashboard.
   */
  getPostAuthPath(user) {
    const role = user?.activeRole || user?.role;
    return role ? getDashboardPath(role) : "/";
  },
};

export const logoutAndRedirect = async (navigate) => {
  await authService.logout();
  window.location.href = "/";
};

export default authService;