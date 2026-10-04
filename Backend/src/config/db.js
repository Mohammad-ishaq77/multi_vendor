import { DataSource } from "typeorm";
import { config } from "../config/env.js";

import { User } from "../entities/User.js";
import { Category } from "../entities/Category.js";
import { Shop } from "../entities/Shop.js";
import { Product } from "../entities/Product.js";
import { Address } from "../entities/Address.js";
import { CartItem } from "../entities/CartItem.js";
import { WishlistItem } from "../entities/WishlistItem.js";
import { Order } from "../entities/Order.js";
import { OrderItem } from "../entities/OrderItem.js";
import { Payment } from "../entities/Payment.js";
import { Offer } from "../entities/Offer.js";
import { Review } from "../entities/Review.js";
import { DeliveryPartner } from "../entities/DeliveryPartner.js";
import { DeliveryAssignment } from "../entities/DeliveryAssignment.js";
import { Approval } from "../entities/Approval.js";
import { Notification } from "../entities/Notification.js";
import { ShopDocument } from "../entities/ShopDocument.js";
import { DeliveryDocument } from "../entities/DeliveryDocument.js";
import { RefreshToken } from "../entities/RefreshToken.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: config.databaseUrl,
  entities: [
    User,
    Category,
    Shop,
    Product,
    Address,
    CartItem,
    WishlistItem,
    Order,
    OrderItem,
    Payment,
    Offer,
    Review,
    DeliveryPartner,
    DeliveryAssignment,
    Approval,
    Notification,
    ShopDocument,
    DeliveryDocument,
    RefreshToken,
  ],
  synchronize: config.typeormSync,
  logging: config.typeormLogging,
});

let ready = false;

export const isDbReady = () => ready && AppDataSource.isInitialized;

export async function initDb() {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    ready = true;
    console.log("PostgreSQL connected (TypeORM).");
  } catch (err) {
    ready = false;
    console.warn(
      "PostgreSQL unavailable — running in degraded mode (DB routes return 503).",
      err?.message || err
    );
  }
  return ready;
}

/** Get a repository, or throw a 503 error when DB is down. */
export function repo(name) {
  if (!isDbReady()) throw Object.assign(new Error("Database unavailable."), { status: 503 });
  return AppDataSource.getRepository(name);
}
