const isBrowser = () => typeof window !== "undefined";

export const storageService = {
  get(key) {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key, value) {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      /* silent */
    }
  },

  getJSON(key, fallback = null) {
    const raw = this.get(key);
    if (raw == null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  setJSON(key, value) {
    this.set(key, JSON.stringify(value));
  },

  remove(key) {
    if (!isBrowser()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      /* silent */
    }
  },

  removeMany(keys = []) {
    keys.forEach((key) => this.remove(key));
  },
};

export default storageService;
