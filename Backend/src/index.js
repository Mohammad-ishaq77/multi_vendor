import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createServer } from "http";
import { config, isDevSecret } from "./config/env.js";
import { initDb } from "./config/db.js";
import { LOCAL_UPLOAD_DIR } from "./config/cloudinary.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./common/middleware/error.js";
import { registerParamValidators } from "./common/middleware/params.js";
import { initSocket } from "./realtime/socket.js";

import authRoutes from "./modules/auth/routes.js";
import usersRoutes from "./modules/users/routes.js";
import categoriesRoutes from "./modules/categories/routes.js";
import shopsRoutes from "./modules/shops/routes.js";
import productsRoutes from "./modules/products/routes.js";
import cartRoutes from "./modules/cart/routes.js";
import wishlistRoutes from "./modules/wishlist/routes.js";
import addressesRoutes from "./modules/addresses/routes.js";
import ordersRoutes from "./modules/orders/routes.js";
import paymentsRoutes from "./modules/payments/routes.js";
import offersRoutes from "./modules/offers/routes.js";
import reviewsRoutes from "./modules/reviews/routes.js";
import deliveryRoutes from "./modules/delivery/routes.js";
import notificationsRoutes from "./modules/notifications/routes.js";
import approvalsRoutes from "./modules/approvals/routes.js";
import reportsRoutes from "./modules/reports/routes.js";
import uploadsRoutes from "./modules/uploads/routes.js";
import adminRoutes from "./modules/admin/routes.js";
import shopkeeperRoutes from "./modules/shopkeeper/routes.js";
import customerRoutes from "./modules/customer/routes.js";
import aiRoutes from "./modules/ai/routes.js";

export function buildApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: config.clientOrigin, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));
  app.use(rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false }));
  // Development stub uploads (Cloudinary not configured) are served from here.
  app.use("/uploads", express.static(LOCAL_UPLOAD_DIR, { fallthrough: true, maxAge: "1h" }));

  // Razorpay webhook needs the raw body for signature validation
  app.use(
    express.json({
      limit: "1mb",
      verify: (req, _res, buf) => {
        if (req.originalUrl === "/api/payments/webhook") req.rawBody = buf;
      },
    })
  );

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "nearmart-api", version: "2.0.0" });
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (_req, res) => res.json(swaggerSpec));

  const apiRouters = {
    "/api/auth": authRoutes,
    "/api/users": usersRoutes,
    "/api/categories": categoriesRoutes,
    "/api/shops": shopsRoutes,
    "/api/products": productsRoutes,
    "/api/cart": cartRoutes,
    "/api/wishlist": wishlistRoutes,
    "/api/addresses": addressesRoutes,
    "/api/orders": ordersRoutes,
    "/api/payments": paymentsRoutes,
    "/api/offers": offersRoutes,
    "/api/reviews": reviewsRoutes,
    "/api/delivery": deliveryRoutes,
    "/api/notifications": notificationsRoutes,
    "/api/approvals": approvalsRoutes,
    "/api/reports": reportsRoutes,
    "/api/uploads": uploadsRoutes,
    "/api/admin": adminRoutes,
    "/api/shopkeeper": shopkeeperRoutes,
    "/api/customer": customerRoutes,
    "/api/ai": aiRoutes,
  };

  // Malformed UUIDs must fail with 400 instead of a driver-level 500. Route params
  // live on each router, so every router gets the validators before it is mounted.
  for (const router of new Set([...Object.values(apiRouters), customerRoutes])) {
    registerParamValidators(router);
  }
  for (const [prefix, router] of Object.entries(apiRouters)) {
    app.use(prefix, router);
  }
  app.use("/api", customerRoutes); // also serves GET /api/profile + PUT /api/profile

  app.use("/api", (_req, res) => res.status(404).json({ ok: false, error: "Not found." }));
  app.use(errorHandler);
  return app;
}

const isMain = (process.argv[1] || "").replace(/\\/g, "/").endsWith("src/index.js");
if (process.env.JEST_WORKER_ID === undefined && isMain) {
  const app = buildApp();
  const server = createServer(app);
  initSocket(server, config.clientOrigin);
  await initDb();
  if (isDevSecret) {
    console.warn("WARNING: using default JWT secrets — set JWT_ACCESS_SECRET/JWT_REFRESH_SECRET in .env");
  }
  server.listen(config.port, () => {
    console.log(`NearMart API running on http://localhost:${config.port} (docs: /docs)`);
  });
}
