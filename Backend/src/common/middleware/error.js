// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err?.status || 500;
  const message = err?.message || "Internal server error.";
  if (status >= 500) console.error(err);
  // Surface stable machine-readable codes (e.g. EMAIL_NOT_VERIFIED, OTP_COOLDOWN)
  // and retry hints so clients can react without parsing English messages.
  const extra = {};
  if (err?.code) extra.code = err.code;
  if (err?.retryAfter) extra.retryAfter = err.retryAfter;
  res.status(status).json({ ok: false, error: message, ...extra });
}

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
