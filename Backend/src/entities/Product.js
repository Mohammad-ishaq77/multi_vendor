import { EntitySchema } from "typeorm";

export const Product = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    shopId: { type: "uuid", name: "shop_id" },
    categoryId: { type: "uuid", nullable: true, name: "category_id" },
    name: { type: "varchar", length: 200 },
    description: { type: "text", nullable: true },
    price: { type: "decimal", precision: 10, scale: 2 },
    mrp: { type: "decimal", precision: 10, scale: 2, nullable: true },
    stock: { type: "int", default: 0 },
    unit: { type: "varchar", length: 30, nullable: true },
    imageUrl: { type: "varchar", length: 500, nullable: true, name: "image_url" },
    images: { type: "jsonb", nullable: true },
    isAvailable: { type: "boolean", default: true, name: "is_available" },
    discountPct: { type: "decimal", precision: 5, scale: 2, default: 0, name: "discount_pct" },
    rating: { type: "decimal", precision: 3, scale: 2, default: 0 },
    reviewCount: { type: "int", default: 0, name: "review_count" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
    updatedAt: { type: "timestamptz", updateDate: true, name: "updated_at" },
  },
  relations: {
    shop: { type: "many-to-one", target: "Shop", joinColumn: { name: "shop_id" }, onDelete: "CASCADE" },
    category: { type: "many-to-one", target: "Category", joinColumn: { name: "category_id" }, nullable: true, onDelete: "SET NULL" },
  },
});
