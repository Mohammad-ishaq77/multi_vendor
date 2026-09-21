import { APP_CONFIG, AUTH_STORAGE_KEYS, STORAGE_KEYS, TEST_CREDENTIALS } from "../config/appConfig";
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
    id: extras.id || `user-${role}-${Date.now()}`,
    name: extras.name || `NearMart ${meta.label}`,
    email: extras.email || TEST_CREDENTIALS.email,
    phone: extras.phone || "",
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

  saveSession(user, persist = true) {
    const session = {
      authenticated: true,
      role: user.role,
      userId: user.id,
      persist,
      savedAt: new Date().toISOString(),
    };
    storageService.setJSON(STORAGE_KEYS.AUTH, session, persist);
    storageService.setJSON(STORAGE_KEYS.USER, user, persist);
    storageService.set(STORAGE_KEYS.ROLE, user.role, persist);
    storageService.setJSON(STORAGE_KEYS.SESSION, session, persist);
    storageService.set(STORAGE_KEYS.PERSIST, persist ? "1" : "0", persist);
    emitAuthChange();
  },

  clearSession() {
    storageService.removeMany([...AUTH_STORAGE_KEYS, STORAGE_KEYS.PERSIST]);
    emitAuthChange();
  },

  login({ email, password, role, remember = true }) {
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
    this.saveSession(user, remember !== false);

    return {
      ok: true,
      user,
      redirectTo: this.getPostAuthPath(user),
    };
  },

  getPostAuthPath(user = this.getCurrentUser()) {
    if (!user?.role) return "/";

    if (user.role === ROLES.SHOPKEEPER) {
      const shop = storageService.getJSON(STORAGE_KEYS.SHOPKEEPER_SHOP);
      if (!shop?.isApproved) {
        const step = storageService.getJSON(STORAGE_KEYS.SHOPKEEPER_ONBOARDING) || "type_selection";
        return (
          {
            type_selection: "/shopkeeper/onboarding",
            create_shop: "/shopkeeper/onboarding/create-shop",
            documents: "/shopkeeper/onboarding/documents",
            approval: "/shopkeeper/onboarding/approval",
            approved: "/shopkeeper/dashboard",
          }[step] || "/shopkeeper/onboarding"
        );
      }
    }

    if (user.role === ROLES.DELIVERY) {
      const done = storageService.getJSON(STORAGE_KEYS.DELIVERY_ONBOARDING);
      if (!done) {
        const step = storageService.getJSON("nearmart_dp_onboardingStep") || "guidelines";
        return (
          {
            guidelines: "/delivery/onboarding/guidelines",
            contact: "/delivery/onboarding/contact",
            identity: "/delivery/onboarding/identity",
            address: "/delivery/onboarding/address",
            documents: "/delivery/onboarding/documents",
            verification: "/delivery/onboarding/verification",
            approved: "/delivery/dashboard",
          }[step] || "/delivery/onboarding/guidelines"
        );
      }
    }

    return getDashboardPath(user.role);
  },

  resetShopkeeperWorkspace(user) {
    storageService.setJSON(STORAGE_KEYS.SHOPKEEPER_ONBOARDING, "type_selection");
    storageService.setJSON(STORAGE_KEYS.SHOPKEEPER_SHOP, {
      id: `shop_${Date.now()}`,
      name: "",
      description: "",
      type: "",
      typeId: null,
      phone: user.phone || "",
      email: user.email || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      openingTime: "09:00",
      closingTime: "21:00",
      isOpen: false,
      isApproved: false,
      rating: 0,
      totalReviews: 0,
      deliveryTime: "30–45 mins",
      minOrder: 99,
      shopImage: null,
      bannerImage: null,
      logoImage: null,
      createdAt: new Date().toISOString(),
    });
    storageService.setJSON("nearmart_sk_products", []);
    storageService.setJSON("nearmart_sk_digilocker", false);
    storageService.setJSON("nearmart_sk_profile", {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      image: null,
      joinedDate: new Date().toISOString().split("T")[0],
      role: ROLES.SHOPKEEPER,
    });
  },

  resetDeliveryWorkspace(user) {
    storageService.setJSON(STORAGE_KEYS.DELIVERY_ONBOARDING, false);
    storageService.setJSON(STORAGE_KEYS.DELIVERY_STATUS, "draft");
    storageService.setJSON("nearmart_dp_hasCompletedOnboarding", false);
    storageService.setJSON("nearmart_dp_applicationStatus", "draft");
    storageService.setJSON("nearmart_dp_onboardingStep", "guidelines");
    storageService.setJSON("nearmart_dp_agreedToGuidelines", false);
    storageService.setJSON("nearmart_dp_identityData", null);
    storageService.setJSON("nearmart_dp_addressData", null);
    storageService.setJSON("nearmart_dp_documentsData", null);
    storageService.setJSON("nearmart_dp_digilockerVerified", false);
    storageService.setJSON("nearmart_dp_contactData", {
      fullName: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      vehicleType: "",
      vehicleNumber: "",
      phoneVerified: false,
      emailVerified: false,
    });
    storageService.setJSON("nearmart_dp_profile", {
      ...storageService.getJSON("nearmart_dp_profile"),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      verificationStatus: "pending",
      applicationStatus: "draft",
      onboardingStep: "guidelines",
      vehicleType: "",
      vehicleNumber: "",
    });
  },

  register({ name, email, password, phone, role, remember = true }) {
    if (!name?.trim() || !email?.trim() || !password) {
      return { ok: false, error: "Please complete all required fields." };
    }

    if (!isValidRole(role)) {
      return { ok: false, error: "Please select a valid role." };
    }

    const user = buildUser(role, {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || "",
    });

    if (role === ROLES.SHOPKEEPER) this.resetShopkeeperWorkspace(user);
    if (role === ROLES.DELIVERY) this.resetDeliveryWorkspace(user);

    this.saveSession(user, remember !== false);

    return {
      ok: true,
      user,
      redirectTo: this.getPostAuthPath(user),
    };
  },

  logout() {
    this.clearSession();
  },
};

export const logoutAndRedirect = (navigate) => {
  navigate("/", { replace: true });
  authService.logout();
};

export default authService;
