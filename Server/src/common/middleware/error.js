// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err?.status || 500;
  const message = err?.message || "Internal server error.";
  if (status >= 500) console.error(err);
  res.status(status).json({ ok: false, error: message });
}

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
