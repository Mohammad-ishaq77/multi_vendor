import { EntitySchema } from "typeorm";

export const OrderItem = new EntitySchema({
  name: "OrderItem",
  tableName: "order_items",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    orderId: { type: "uuid", name: "order_id" },
    productId: { type: "uuid", nullable: true, name: "product_id" },
    name: { type: "varchar", length: 200, nullable: true },
    price: { type: "decimal", precision: 10, scale: 2, nullable: true },
    quantity: { type: "int", nullable: true },
    imageUrl: { type: "varchar", length: 500, nullable: true, name: "image_url" },
    subtotal: { type: "decimal", precision: 10, scale: 2, nullable: true },
  },
  relations: {
    order: { type: "many-to-one", target: "Order", joinColumn: { name: "order_id" }, onDelete: "CASCADE" },
  },
});
