import { EntitySchema } from "typeorm";

export const Approval = new EntitySchema({
  name: "Approval",
  tableName: "approvals",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    applicantId: { type: "uuid", name: "applicant_id" },
    type: { type: "enum", enum: ["shopkeeper", "delivery_partner"] },
    status: { type: "enum", enum: ["pending", "approved", "rejected"], default: "pending" },
    notes: { type: "text", nullable: true },
    reviewedBy: { type: "uuid", nullable: true, name: "reviewed_by" },
    reviewedAt: { type: "timestamptz", nullable: true, name: "reviewed_at" },
    appliedAt: { type: "timestamptz", createDate: true, name: "applied_at" },
  },
});
