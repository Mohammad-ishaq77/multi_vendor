import { EntitySchema } from "typeorm";

export const ShopDocument = new EntitySchema({
  name: "ShopDocument",
  tableName: "shop_documents",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    shopId: { type: "uuid", name: "shop_id" },
    type: { type: "varchar", length: 50, nullable: true },
    url: { type: "varchar", length: 500, nullable: true },
    isVerified: { type: "boolean", default: false, name: "is_verified" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
});
