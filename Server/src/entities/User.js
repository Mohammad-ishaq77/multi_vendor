import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: "varchar", length: 100 },
    email: { type: "varchar", length: 150, unique: true },
    phone: { type: "varchar", length: 15, nullable: true },
    passwordHash: { type: "varchar", length: 255, name: "password" },
    role: {
      type: "enum",
      enum: ["customer", "shopkeeper", "delivery", "admin"],
    },
    avatarUrl: { type: "varchar", length: 500, nullable: true, name: "avatar_url" },
    isActive: { type: "boolean", default: true, name: "is_active" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
    updatedAt: { type: "timestamptz", updateDate: true, name: "updated_at" },
  },
});

export function publicUser(u) {
  if (!u) return u;
  const { passwordHash, password, ...rest } = u;
  return rest;
}
