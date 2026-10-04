import { EntitySchema } from "typeorm";

export const Payment = new EntitySchema({
  name: "Payment",
  tableName: "payments",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    orderId: { type: "uuid", nullable: true, name: "order_id" },
    userId: { type: "uuid", nullable: true, name: "user_id" },
    razorpayOrderId: { type: "varchar", length: 100, unique: true, nullable: true, name: "razorpay_order_id" },
    razorpayPaymentId: { type: "varchar", length: 100, nullable: true, name: "razorpay_payment_id" },
    razorpaySignature: { type: "varchar", length: 200, nullable: true, name: "razorpay_signature" },
    amount: { type: "decimal", precision: 10, scale: 2, nullable: true },
    currency: { type: "varchar", length: 5, default: "INR" },
    status: {
      type: "enum",
      enum: ["created", "authorized", "captured", "failed", "refunded"],
      default: "created",
    },
    method: { type: "varchar", length: 50, nullable: true },
    email: { type: "varchar", length: 150, nullable: true },
    contact: { type: "varchar", length: 15, nullable: true },
    capturedAt: { type: "timestamptz", nullable: true, name: "captured_at" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
});
