import dotenv from "dotenv";

dotenv.config();

const num = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const demoOtpEnabled =
  process.env.DEMO_OTP_ENABLED === "true" ||
  (process.env.NODE_ENV !== "production" && process.env.DEMO_OTP_ENABLED !== "false");

// A fixed, client-visible OTP must never be available in a production deployment.
if (process.env.NODE_ENV === "production" && demoOtpEnabled) {
  throw new Error("DEMO_OTP_ENABLED cannot be enabled in production.");
}

/**
 * Never let a placeholder reach production: outside development a missing value
 * stops the process instead of booting with a known secret.
 */
function required(name, value, devFallback) {
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return devFallback;
}

/**
 * Pick the outbound email provider without hardcoding credentials.
 *
 * - `EMAIL_PROVIDER` forces `resend` or `smtp`.
 * - Otherwise Resend wins when an API key is present, then SMTP (Gmail).
 */
function resolveMailProvider() {
  const explicit = (process.env.EMAIL_PROVIDER || "").trim().toLowerCase();
  if (explicit === "resend" || explicit === "smtp") return explicit;
  if (process.env.RESEND_API_KEY || process.env.EMAIL_SERVICE_API_KEY) return "resend";
  if (process.env.SMTP_HOST || process.env.MAIL_USER) return "smtp";
  return "";
}

const mailProvider = resolveMailProvider();

// Gmail app passwords are shown grouped with spaces; the real secret has none.
const cleanSecret = (value) => String(value || "").replace(/\s+/g, "");

const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER || "";
const smtpPass = cleanSecret(process.env.SMTP_PASS || process.env.MAIL_PASS);
const smtpPort = num(process.env.SMTP_PORT, 587);

const mailSenderEmail =
  process.env.SENDER_EMAIL || smtpUser || process.env.MAIL_USER || "";

const clientOrigin = required(
  "CLIENT_ORIGIN",
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173"
);

// Support a comma-separated allow-list so local + deployed frontends can share
// one backend without loosening CORS to "*".
const clientOrigins = clientOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  port: num(process.env.PORT, 5000),
  demoOtpEnabled,
  clientOrigin,
  clientOrigins,
  databaseUrl: required(
    "DATABASE_URL",
    process.env.DATABASE_URL,
    "postgres://nearmart:nearmart@localhost:5432/nearmart"
  ),
  typeormSync: process.env.TYPEORM_SYNC === "true",
  typeormLogging: process.env.TYPEORM_LOGGING === "true",
  jwt: {
    accessSecret: required(
      "JWT_ACCESS_SECRET",
      process.env.JWT_ACCESS_SECRET,
      "dev-access-secret-change-me"
    ),
    refreshSecret: required(
      "JWT_REFRESH_SECRET",
      process.env.JWT_REFRESH_SECRET,
      "dev-refresh-secret-change-me"
    ),
    accessTtl: process.env.JWT_ACCESS_TTL || "15m",
    refreshTtlDays: num(process.env.JWT_REFRESH_TTL_DAYS, 7),
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  ai: {
    ollamaHost: process.env.OLLAMA_HOST || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama3",
    apiKey: process.env.OLLAMA_API_KEY || "",
  },
  routing: {
    osrmBaseUrl: (process.env.OSRM_BASE_URL || "https://router.project-osrm.org").replace(/\/+$/, ""),
    timeoutMs: num(process.env.ROUTING_TIMEOUT_MS, 8000),
  },
  // Outbound email. Optional so the API can still boot without it; the email
  // service reports a clear failure instead of pretending to send.
  // Supports Resend (HTTP API) or SMTP/Gmail (Nodemailer).
  mail: {
    provider: mailProvider,
    resendApiKey:
      process.env.RESEND_API_KEY || process.env.EMAIL_SERVICE_API_KEY || "",
    smtp: {
      host: process.env.SMTP_HOST || "",
      port: smtpPort,
      secure:
        process.env.SMTP_SECURE === "true" ||
        (process.env.SMTP_SECURE !== "false" && smtpPort === 465),
      user: smtpUser,
      pass: smtpPass,
    },
    senderEmail: mailSenderEmail,
    senderName: process.env.SENDER_NAME || "NearMart",
    // `contactTo` is the NearMart inbox that receives public contact messages.
    contactTo:
      process.env.RECEIVER_EMAIL ||
      process.env.MAIL_CONTACT_TO ||
      process.env.MAIL_USER ||
      "",
  },
};

export const isMailConfigured =
  mailProvider === "resend"
    ? Boolean(config.mail.resendApiKey && config.mail.senderEmail)
    : mailProvider === "smtp"
      ? Boolean(
          config.mail.senderEmail &&
            (config.mail.smtp.host || config.mail.smtp.user) &&
            (config.mail.smtp.host ? true : config.mail.smtp.pass)
        )
      : false;

export const isDevSecret =
  config.jwt.accessSecret.includes("change-me") ||
  config.jwt.refreshSecret.includes("change-me");
