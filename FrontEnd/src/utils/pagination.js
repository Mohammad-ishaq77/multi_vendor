/**
 * One place that understands the backend's paginated envelope.
 *
 * `{ ok, data: [...], pagination: { page, limit, total, pages } }`
 *
 * `apiClient` keeps the envelope intact when `pagination` is present, so every
 * list endpoint funnels through `toPage()` and callers always get the same
 * `{ items, pagination }` shape — never a silently unpaginated array.
 */

export const EMPTY_PAGINATION = { page: 1, limit: 20, total: 0, pages: 1, hasNext: false, hasPrev: false };

const asItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.orders)) return payload.orders;
  return [];
};

const asPagination = (payload) => {
  const source =
    (payload && typeof payload === "object" && (payload.pagination || payload.meta)) || null;
  if (!source) return EMPTY_PAGINATION;

  const page = Number(source.page) || 1;
  const limit = Number(source.limit) || Number(source.perPage) || 20;
  const total = Number(source.total) || 0;
  const pages = Number(source.pages) || Number(source.totalPages) || Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
};

export const toPage = (payload) => ({
  items: asItems(payload),
  pagination: asPagination(payload),
});

/** Total pages, or null when the endpoint does not paginate. */
export const pageCount = (pagination) => (pagination ? pagination.pages : null);

export default toPage;