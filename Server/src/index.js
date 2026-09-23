import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createServer } from "http";
import { config, isDevSecret } from "./config/env.js";
import { initDb } from "./config/db.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./common/middleware/error.js";
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

export function buildApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: config.clientOrigin, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));
  app.use(rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false }));

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

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/shops", shopsRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/addresses", addressesRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/offers", offersRoutes);
  app.use("/api/reviews", reviewsRoutes);
  app.use("/api/delivery", deliveryRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/approvals", approvalsRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/uploads", uploadsRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/shopkeeper", shopkeeperRoutes);
  app.use("/api/customer", customerRoutes);
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
