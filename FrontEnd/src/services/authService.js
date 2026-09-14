import { APP_CONFIG, STORAGE_KEYS, TEST_CREDENTIALS } from "../config/appConfig";
import { ROLES, getDashboardPath, getRoleMeta, isValidRole } from "../config/roles";
import storageService from "./storageService";

const AUTH_EVENT = "nearmart-auth-change";

const emitAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
};

export const AUTH_CHANGE_EVENT = AUTH_EVENT;

const matchesTestEmail = (email = "") => {
  const normalized = email.trim().toLowerCase();
  return TEST_CREDENTIALS.aliases.includes(normalized);
};

const buildUser = (role, extras = {}) => {
  const meta = getRoleMeta(role);
  return {
    id: `user-${role}-001`,
    name: extras.name || `NearMart ${meta.label}`,
    email: extras.email || TEST_CREDENTIALS.email,
    role,
    roleLabel: meta.label,
    avatar: extras.avatar || APP_CONFIG.logo,
    loggedInAt: new Date().toISOString(),
  };
};

const prepareRoleWorkspace = (role) => {
  if (role === ROLES.SHOPKEEPER) {
    storageService.setJSON(STORAGE_KEYS.SHOPKEEPER_ONBOARDING, "approved");
    const shop = storageService.getJSON(STORAGE_KEYS.SHOPKEEPER_SHOP);
    if (shop) {
      storageService.setJSON(STORAGE_KEYS.SHOPKEEPER_SHOP, { ...shop, isApproved: true });
    }
  }

  if (role === ROLES.DELIVERY) {
    storageService.setJSON(STORAGE_KEYS.DELIVERY_ONBOARDING, true);
    storageService.setJSON(STORAGE_KEYS.DELIVERY_STATUS, "approved");
  }
};

export const authService = {
  getCurrentUser() {
    return storageService.getJSON(STORAGE_KEYS.USER);
  },

  getRole() {
    return storageService.get(STORAGE_KEYS.ROLE) || this.getCurrentUser()?.role || null;
  },

  isAuthenticated() {
    const auth = storageService.getJSON(STORAGE_KEYS.AUTH);
    const user = this.getCurrentUser();
    return Boolean(auth?.authenticated && user);
  },

  saveSession(user) {
    const session = {
      authenticated: true,
      role: user.role,
      userId: user.id,
      savedAt: new Date().toISOString(),
    };
    storageService.setJSON(STORAGE_KEYS.AUTH, session);
    storageService.setJSON(STORAGE_KEYS.USER, user);
    storageService.set(STORAGE_KEYS.ROLE, user.role);
    storageService.setJSON(STORAGE_KEYS.SESSION, session);
    emitAuthChange();
  },

  clearSession() {
    storageService.removeMany([
      STORAGE_KEYS.AUTH,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.ROLE,
      STORAGE_KEYS.SESSION,
    ]);
    emitAuthChange();
  },

  login({ email, password, role }) {
    if (!email?.trim() || !password) {
      return { ok: false, error: "Please enter your email and password." };
    }

    if (!isValidRole(role)) {
      return { ok: false, error: "Please select a valid role to continue." };
    }

    if (!matchesTestEmail(email) || password !== TEST_CREDENTIALS.password) {
      return {
        ok: false,
        error: `Invalid credentials. Use ${TEST_CREDENTIALS.email} / ${TEST_CREDENTIALS.password} for testing.`,
      };
    }

    prepareRoleWorkspace(role);
    const user = buildUser(role, { email: TEST_CREDENTIALS.email });
    this.saveSession(user);

    return {
      ok: true,
      user,
      redirectTo: getDashboardPath(role),
    };
  },

  register({ name, email, password, role }) {
    if (!name?.trim() || !email?.trim() || !password) {
      return { ok: false, error: "Please complete all required fields." };
    }

    if (!isValidRole(role)) {
      return { ok: false, error: "Please select a valid role." };
    }

    const user = buildUser(role, { name: name.trim(), email: email.trim() });
    this.saveSession(user);

    return {
      ok: true,
      user,
      redirectTo: getDashboardPath(role),
    };
  },

  logout() {
    this.clearSession();
  },
};

export const logoutAndRedirect = (navigate) => {
  authService.logout();
  navigate("/login", { replace: true });
};

export default authService;
