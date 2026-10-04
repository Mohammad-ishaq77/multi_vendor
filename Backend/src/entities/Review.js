import { EntitySchema } from "typeorm";

export const Review = new EntitySchema({
  name: "Review",
  tableName: "reviews",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    orderId: { type: "uuid", nullable: true, name: "order_id" },
    shopId: { type: "uuid", name: "shop_id" },
    productId: { type: "uuid", nullable: true, name: "product_id" },
    reviewerId: { type: "uuid", name: "reviewer_id" },
    rating: { type: "smallint" },
    comment: { type: "text", nullable: true },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
  relations: {
    shop: { type: "many-to-one", target: "Shop", joinColumn: { name: "shop_id" }, onDelete: "CASCADE" },
  },
});
