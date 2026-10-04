import { EntitySchema } from "typeorm";

export const Notification = new EntitySchema({
  name: "Notification",
  tableName: "notifications",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    userId: { type: "uuid", name: "user_id" },
    title: { type: "varchar", length: 150, nullable: true },
    message: { type: "text", nullable: true },
    type: { type: "varchar", length: 50, nullable: true },
    isRead: { type: "boolean", default: false, name: "is_read" },
    metadata: { type: "jsonb", nullable: true },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
});
