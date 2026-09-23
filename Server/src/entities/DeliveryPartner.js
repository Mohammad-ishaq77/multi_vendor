import { EntitySchema } from "typeorm";

export const DeliveryPartner = new EntitySchema({
  name: "DeliveryPartner",
  tableName: "delivery_partners",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    userId: { type: "uuid", unique: true, name: "user_id" },
    vehicleType: { type: "varchar", length: 50, nullable: true, name: "vehicle_type" },
    vehicleNumber: { type: "varchar", length: 30, nullable: true, name: "vehicle_number" },
    isOnline: { type: "boolean", default: false, name: "is_online" },
    isApproved: { type: "boolean", default: false, name: "is_approved" },
    onboardingStep: { type: "varchar", length: 50, default: "guidelines", name: "onboarding_step" },
    applicationStatus: {
      type: "enum",
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
      name: "application_status",
    },
    rating: { type: "decimal", precision: 3, scale: 2, default: 0 },
    totalDeliveries: { type: "int", default: 0, name: "total_deliveries" },
    completedDeliveries: { type: "int", default: 0, name: "completed_deliveries" },
    cancelledDeliveries: { type: "int", default: 0, name: "cancelled_deliveries" },
    todayDeliveries: { type: "int", default: 0, name: "today_deliveries" },
    totalEarnings: { type: "decimal", precision: 12, scale: 2, default: 0, name: "total_earnings" },
    todayEarnings: { type: "decimal", precision: 10, scale: 2, default: 0, name: "today_earnings" },
    contactData: { type: "jsonb", nullable: true, name: "contact_data" },
    identityData: { type: "jsonb", nullable: true, name: "identity_data" },
    addressData: { type: "jsonb", nullable: true, name: "address_data" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
    updatedAt: { type: "timestamptz", updateDate: true, name: "updated_at" },
  },
  relations: {
    user: { type: "many-to-one", target: "User", joinColumn: { name: "user_id" }, onDelete: "CASCADE" },
  },
});
