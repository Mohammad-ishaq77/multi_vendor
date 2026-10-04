import { EntitySchema } from "typeorm";

export const Address = new EntitySchema({
  name: "Address",
  tableName: "addresses",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    userId: { type: "uuid", name: "user_id" },
    label: { type: "varchar", length: 50, nullable: true },
    fullName: { type: "varchar", length: 100, nullable: true, name: "full_name" },
    phone: { type: "varchar", length: 15, nullable: true },
    line1: { type: "text" },
    line2: { type: "text", nullable: true },
    city: { type: "varchar", length: 100, nullable: true },
    state: { type: "varchar", length: 100, nullable: true },
    pincode: { type: "varchar", length: 10, nullable: true },
    lat: { type: "decimal", precision: 10, scale: 7, nullable: true },
    lng: { type: "decimal", precision: 10, scale: 7, nullable: true },
    location: { type: "geography", spatialFeatureType: "Point", srid: 4326, nullable: true },
    isDefault: { type: "boolean", default: false, name: "is_default" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
  relations: {
    user: { type: "many-to-one", target: "User", joinColumn: { name: "user_id" }, onDelete: "CASCADE" },
  },
});
