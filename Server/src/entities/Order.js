import { EntitySchema } from "typeorm";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
];

export const Order = new EntitySchema({
  name: "Order",
  tableName: "orders",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    customerId: { type: "uuid", name: "customer_id" },
    shopId: { type: "uuid", name: "shop_id" },
    deliveryPartnerId: { type: "uuid", nullable: true, name: "delivery_partner_id" },
    addressId: { type: "uuid", nullable: true, name: "address_id" },
    status: { type: "enum", enum: ORDER_STATUSES, default: "pending" },
    paymentStatus: {
      type: "enum",
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      name: "payment_status",
    },
    paymentMethod: { type: "varchar", length: 50, nullable: true, name: "payment_method" },
    subtotal: { type: "decimal", precision: 10, scale: 2, nullable: true },
    deliveryFee: { type: "decimal", precision: 10, scale: 2, default: 0, name: "delivery_fee" },
    discount: { type: "decimal", precision: 10, scale: 2, default: 0 },
    totalAmount: { type: "decimal", precision: 10, scale: 2, nullable: true, name: "total_amount" },
    notes: { type: "text", nullable: true },
    estimatedDelivery: { type: "timestamptz", nullable: true, name: "estimated_delivery" },
    deliveredAt: { type: "timestamptz", nullable: true, name: "delivered_at" },
    cancelledAt: { type: "timestamptz", nullable: true, name: "cancelled_at" },
    cancelReason: { type: "text", nullable: true, name: "cancel_reason" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
    updatedAt: { type: "timestamptz", updateDate: true, name: "updated_at" },
  },
  relations: {
    customer: { type: "many-to-one", target: "User", joinColumn: { name: "customer_id" }, onDelete: "CASCADE" },
    shop: { type: "many-to-one", target: "Shop", joinColumn: { name: "shop_id" }, onDelete: "CASCADE" },
    items: { type: "one-to-many", target: "OrderItem", inverseSide: "order" },
  },
});
