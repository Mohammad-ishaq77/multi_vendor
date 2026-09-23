import dotenv from "dotenv";

dotenv.config();

const num = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const config = {
  port: num(process.env.PORT, 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://nearmart:nearmart@localhost:5432/nearmart",
  typeormSync: process.env.TYPEORM_SYNC === "true",
  typeormLogging: process.env.TYPEORM_LOGGING === "true",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
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
};

export const isDevSecret =
  config.jwt.accessSecret.includes("change-me") ||
  config.jwt.refreshSecret.includes("change-me");
