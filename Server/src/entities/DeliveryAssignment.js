import { EntitySchema } from "typeorm";

export const DeliveryAssignment = new EntitySchema({
  name: "DeliveryAssignment",
  tableName: "delivery_assignments",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    orderId: { type: "uuid", unique: true, name: "order_id" },
    partnerId: { type: "uuid", nullable: true, name: "partner_id" },
    status: {
      type: "enum",
      enum: ["assigned", "picked_up", "out_for_delivery", "delivered", "failed"],
      default: "assigned",
    },
    partnerEarning: { type: "decimal", precision: 10, scale: 2, nullable: true, name: "partner_earning" },
    distanceKm: { type: "decimal", precision: 6, scale: 2, nullable: true, name: "distance_km" },
    pickedUpAt: { type: "timestamptz", nullable: true, name: "picked_up_at" },
    deliveredAt: { type: "timestamptz", nullable: true, name: "delivered_at" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
});
