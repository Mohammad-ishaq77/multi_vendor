import { EntitySchema } from "typeorm";

export const WishlistItem = new EntitySchema({
  name: "WishlistItem",
  tableName: "wishlist_items",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    userId: { type: "uuid", name: "user_id" },
    productId: { type: "uuid", name: "product_id" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
  uniques: [{ name: "uq_wishlist_user_product", columns: ["userId", "productId"] }],
  relations: {
    product: { type: "many-to-one", target: "Product", joinColumn: { name: "product_id" }, onDelete: "CASCADE" },
  },
});
