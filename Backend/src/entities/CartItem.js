import { EntitySchema } from "typeorm";

export const CartItem = new EntitySchema({
  name: "CartItem",
  tableName: "cart_items",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    userId: { type: "uuid", name: "user_id" },
    productId: { type: "uuid", name: "product_id" },
    shopId: { type: "uuid", name: "shop_id" },
    quantity: { type: "int", default: 1 },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
  uniques: [{ name: "uq_cart_user_product", columns: ["userId", "productId"] }],
  relations: {
    product: { type: "many-to-one", target: "Product", joinColumn: { name: "product_id" }, onDelete: "CASCADE" },
    shop: { type: "many-to-one", target: "Shop", joinColumn: { name: "shop_id" }, onDelete: "CASCADE" },
  },
});
