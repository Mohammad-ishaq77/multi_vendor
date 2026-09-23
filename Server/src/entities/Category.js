import { EntitySchema } from "typeorm";

export const Category = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: "varchar", length: 100 },
    slug: { type: "varchar", length: 120, unique: true },
    icon: { type: "varchar", length: 100, nullable: true },
    imageUrl: { type: "varchar", length: 500, nullable: true, name: "image_url" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
});
