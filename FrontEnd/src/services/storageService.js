const isBrowser = () => typeof window !== "undefined";

const stores = () => {
  if (!isBrowser()) return [];
  return [window.localStorage, window.sessionStorage];
};

export const storageService = {
  get(key) {
    if (!isBrowser()) return null;
    try {
      return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key, value, persist = true) {
    if (!isBrowser()) return;
    try {
      const primary = persist ? window.localStorage : window.sessionStorage;
      const secondary = persist ? window.sessionStorage : window.localStorage;
      primary.setItem(key, value);
      secondary.removeItem(key);
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

  setJSON(key, value, persist = true) {
    this.set(key, JSON.stringify(value), persist);
  },

  remove(key) {
    stores().forEach((store) => {
      try {
        store.removeItem(key);
      } catch {
        /* silent */
      }
    });
  },

  removeMany(keys = []) {
    keys.forEach((key) => this.remove(key));
  },
};

export default storageService;
