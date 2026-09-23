import { EntitySchema } from "typeorm";

export const DeliveryDocument = new EntitySchema({
  name: "DeliveryDocument",
  tableName: "delivery_documents",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    partnerId: { type: "uuid", name: "partner_id" },
    type: { type: "varchar", length: 50, nullable: true },
    url: { type: "varchar", length: 500, nullable: true },
    isVerified: { type: "boolean", default: false, name: "is_verified" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
});
