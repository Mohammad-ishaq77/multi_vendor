import { API_BASE_URL, API_TIMEOUT_MS } from "../config/env";
import tokenService from "./tokenService";

/**
 * The one and only HTTP client for the app.
 *
 * Responsibilities:
 *  - builds URLs from the Vite/env configuration (no hardcoded hosts)
 *  - attaches `Authorization: Bearer <accessToken>`
 *  - transparently refreshes an expired access token and replays the request
 *  - normalises backend failures into an ApiError with a user-safe message
 *
 * Components and feature services must use this instead of calling fetch()
 * directly, so auth/error behaviour exists in exactly one place.
 */

export class ApiError extends Error {
  constructor(message, { status = 0, code = null, issues = null, cause = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.issues = issues;
    this.cause = cause;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isConflict() {
    return this.status === 409;
  }

  get isValidationError() {
    return this.status === 400 || this.status === 422;
  }

  get isRateLimited() {
    return this.status === 429;
  }

  get isServerUnavailable() {
    return this.status === 503 || this.status === 502 || this.status === 504;
  }
}

const STATUS_MESSAGES = {
  400: "Some of the details provided are not valid. Please review and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "We could not find what you were looking for.",
  409: "That action conflicts with the current state. Please refresh and try again.",
  422: "Some of the details provided are not valid. Please review and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again in a moment.",
  502: "The server is temporarily unreachable. Please try again shortly.",
  503: "The service is temporarily unavailable. Please try again shortly.",
  504: "The server took too long to respond. Please try again.",
};

/** Paths where a 401 must never trigger a refresh/retry cycle. */
const NO_REFRESH_PATHS = ["/auth/refresh", "/auth/login", "/auth/register"];

export const AUTH_EXPIRED_EVENT = "nearmart-auth-expired";

const isAbsoluteUrl = (path) => /^https?:\/\//i.test(String(path || ""));

const buildUrl = (path, query) => {
  const url = isAbsoluteUrl(path)
    ? String(path)
    : `${API_BASE_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
  const qs = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    qs.append(key, String(value));
  });
  const search = qs.toString();
  return search ? `${url}${url.includes("?") ? "&" : "?"}${search}` : url;
};

const isFormData = (body) =>
  typeof FormData !== "undefined" && body instanceof FormData;

const parseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (response.status === 204) return null;
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    const text = await response.text();
    return text ? { error: text } : null;
  } catch {
    return null;
  }
};

const toApiError = (response, payload, fallbackMessage) => {
  const status = response.status;
  const backendMessage =
    typeof payload?.error === "string" && payload.error.trim()
      ? payload.error.trim()
      : null;
  const message =
    backendMessage && status < 500
      ? backendMessage
      : backendMessage && !/stack|at \w+ \(/i.test(backendMessage)
        ? backendMessage
        : STATUS_MESSAGES[status] || fallbackMessage;

  return new ApiError(message, {
    status,
    issues: Array.isArray(payload?.issues) ? payload.issues : null,
  });
};

const networkError = (cause) =>
  new ApiError(
    "We could not reach the server. Please check your connection and try again.",
    { status: 0, cause }
  );

/* ------------------------------------------------------------------ *
 * Access-token refresh (single flight — many parallel 401s share one
 * refresh round-trip, and a failed refresh can never loop).
 * ------------------------------------------------------------------ */

let refreshPromise = null;
let sessionListener = null;

/** Registered by AuthContext so a failed refresh clears React auth state. */
export const onSessionExpired = (listener) => {
  sessionListener = listener;
};

const notifySessionExpired = () => {
  try {
    sessionListener?.();
  } catch {
    /* listener errors must not break the client */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
};

/**
 * Raw fetch that deliberately skips auth handling. Used for the refresh call
 * itself so a rejected refresh token cannot recurse.
 */
const rawRequest = async (method, path, { body, query, headers, signal } = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const requestHeaders = { Accept: "application/json", ...(headers || {}) };

  let requestBody;
  if (body !== undefined && body !== null) {
    if (isFormData(body) || typeof body === "string") {
      requestBody = body;
    } else {
      requestBody = JSON.stringify(body);
      if (!requestHeaders["Content-Type"]) {
        requestHeaders["Content-Type"] = "application/json";
      }
    }
  }

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
      credentials: "omit",
    });
    return { response, payload: await parseBody(response) };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw networkError(error);
  } finally {
    clearTimeout(timeout);
  }
};

const performRefresh = async () => {
  const refreshToken = tokenService.getRefreshToken();
  if (!refreshToken) return false;

  const activeRole = tokenService.getActiveRole();
  const { response, payload } = await rawRequest("POST", "/auth/refresh", {
    body: { refreshToken, ...(activeRole ? { role: activeRole } : {}) },
  });

  if (!response.ok || payload?.ok === false || !payload?.accessToken) {
    return false;
  }

  tokenService.setTokens({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken || refreshToken,
  });
  if (payload.user?.activeRole) tokenService.setActiveRole(payload.user.activeRole);
  return true;
};

/** Coalesces concurrent refreshes into a single in-flight request. */
const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = performRefresh()
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const shouldSkipRefresh = (path) =>
  NO_REFRESH_PATHS.some((skip) => String(path).startsWith(skip));

/**
 * Perform an API request.
 *
 * @param {string} method  HTTP verb
 * @param {string} path    Path beginning with "/"
 * @param {object} options
 * @param {object} [options.body]      JSON body, FormData, or string
 * @param {object} [options.query]     Query parameters
 * @param {object} [options.headers]   Extra headers
 * @param {boolean}[options.auth=true] Attach the bearer token
 * @param {boolean}[options.retry=true] Allow one refresh-and-replay attempt
 * @param {AbortSignal}[options.signal]
 * @returns {Promise<any>} the parsed `data` payload
 */
export const request = async (method, path, options = {}) => {
  const {
    body,
    query,
    headers,
    auth = true,
    retry = true,
    signal,
    unwrap = true,
  } = options;

  const send = async () => {
    const requestHeaders = { ...(headers || {}) };
    if (auth) {
      const accessToken = tokenService.getAccessToken();
      if (accessToken) {
        requestHeaders.Authorization = `Bearer ${accessToken}`;
      }
    }

    const { response, payload } = await rawRequest(method, path, {
      body,
      query,
      headers: requestHeaders,
      signal,
    });

    if (response.ok && payload?.ok !== false) {
      if (!unwrap || !payload || typeof payload !== "object" || !("data" in payload)) {
        return payload;
      }
      // Paginated endpoints carry `pagination` next to `data`. Unwrapping `data`
      // alone would silently drop the page metadata, so the envelope is kept.
      if (payload.pagination) return payload;
      return payload.data;
    }

    throw toApiError(response, payload, "The request could not be completed.");
  };

  try {
    return await send();
  } catch (error) {
    const isExpired =
      error instanceof ApiError && error.status === 401;

    if (!isExpired || !auth || !retry || shouldSkipRefresh(path)) {
      if (isExpired) {
        tokenService.clear();
        notifySessionExpired();
      }
      throw error;
    }

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      tokenService.clear();
      notifySessionExpired();
      throw new ApiError(STATUS_MESSAGES[401], { status: 401 });
    }

    // Exactly one replay — never a second refresh cycle.
    return send();
  }
};

const query = (params) => {
  const clean = {};
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") clean[key] = value;
  });
  return clean;
};

export const apiClient = {
  get: (path, options = {}) => request("GET", path, { ...options, query: query(options.query) }),
  post: (path, body, options = {}) => request("POST", path, { ...options, body }),
  put: (path, body, options = {}) => request("PUT", path, { ...options, body }),
  patch: (path, body, options = {}) => request("PATCH", path, { ...options, body }),
  delete: (path, options = {}) => request("DELETE", path, options),

  /** Multipart upload — Content-Type is left to the browser. */
  upload: (path, formData, options = {}) =>
    request("POST", path, { ...options, body: formData }),

  /** Escape hatch when a caller needs the whole envelope. */
  request,
};

export { STATUS_MESSAGES, buildUrl, isAbsoluteUrl };
export default apiClient;