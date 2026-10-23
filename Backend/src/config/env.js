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

export const config = {
  port: num(process.env.PORT, 5000),
  demoOtpEnabled,
  clientOrigin: required(
    "CLIENT_ORIGIN",
    process.env.CLIENT_ORIGIN,
    "http://localhost:5173"
  ),
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
  // Gmail SMTP credentials for transactional OTP emails. Optional so the API can
  // still boot without them; the email service reports a clear failure instead.
  mail: {
    user: process.env.MAIL_USER || "",
    pass: process.env.MAIL_PASS || "",
  },
};

export const isMailConfigured = Boolean(config.mail.user && config.mail.pass);

export const isDevSecret =
  config.jwt.accessSecret.includes("change-me") ||
  config.jwt.refreshSecret.includes("change-me");
