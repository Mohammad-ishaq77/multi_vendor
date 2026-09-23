import { EntitySchema } from "typeorm";

export const Offer = new EntitySchema({
  name: "Offer",
  tableName: "offers",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    shopId: { type: "uuid", name: "shop_id" },
    title: { type: "varchar", length: 150, nullable: true },
    description: { type: "text", nullable: true },
    discountType: { type: "enum", enum: ["flat", "percentage"], nullable: true, name: "discount_type" },
    discountValue: { type: "decimal", precision: 10, scale: 2, nullable: true, name: "discount_value" },
    minOrder: { type: "decimal", precision: 10, scale: 2, default: 0, name: "min_order" },
    maxDiscount: { type: "decimal", precision: 10, scale: 2, nullable: true, name: "max_discount" },
    code: { type: "varchar", length: 30, unique: true, nullable: true },
    startsAt: { type: "timestamptz", nullable: true, name: "starts_at" },
    expiresAt: { type: "timestamptz", nullable: true, name: "expires_at" },
    isActive: { type: "boolean", default: true, name: "is_active" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
  relations: {
    shop: { type: "many-to-one", target: "Shop", joinColumn: { name: "shop_id" }, onDelete: "CASCADE" },
  },
});
