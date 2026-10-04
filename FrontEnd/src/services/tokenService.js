import storageService from "./storageService";

const ACCESS_TOKEN_KEY = "nearmart_token_access";
const REFRESH_TOKEN_KEY = "nearmart_token_refresh";
const ACTIVE_ROLE_KEY = "nearmart_active_role";

/**
 * Access/refresh token storage.
 *
 * Tokens are session credentials issued by the backend — never server secrets.
 * They are kept out of the app's data stores so the API client and the auth
 * context cannot drift apart.
 *
 * `activeRole` is remembered separately because a multi-role account picks a role
 * at login: the refresh call has to repeat it, otherwise the new access token
 * would silently fall back to the account's primary role.
 */

const read = (key) => storageService.get(key) || null;

const write = (key, value) => {
  if (value) storageService.set(key, value);
  else storageService.remove(key);
};

export const tokenService = {
  getAccessToken: () => read(ACCESS_TOKEN_KEY),
  getRefreshToken: () => read(REFRESH_TOKEN_KEY),
  getActiveRole: () => read(ACTIVE_ROLE_KEY),

  setActiveRole(role) {
    write(ACTIVE_ROLE_KEY, role);
  },

  setTokens({ accessToken, refreshToken } = {}) {
    if (accessToken !== undefined) write(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken !== undefined) write(REFRESH_TOKEN_KEY, refreshToken);
  },

  setAccessToken(accessToken) {
    write(ACCESS_TOKEN_KEY, accessToken);
  },

  setRefreshToken(refreshToken) {
    write(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear() {
    storageService.removeMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ACTIVE_ROLE_KEY]);
  },

  hasSession() {
    return Boolean(read(ACCESS_TOKEN_KEY) || read(REFRESH_TOKEN_KEY));
  },
};

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ACTIVE_ROLE_KEY };
export default tokenService;