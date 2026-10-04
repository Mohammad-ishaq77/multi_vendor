import { EntitySchema } from "typeorm";

export const RefreshToken = new EntitySchema({
  name: "RefreshToken",
  tableName: "refresh_tokens",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    userId: { type: "uuid", name: "user_id" },
    token: { type: "varchar", length: 500, unique: true },
    expiresAt: { type: "timestamptz", name: "expires_at" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      onDelete: "CASCADE",
    },
  },
});
