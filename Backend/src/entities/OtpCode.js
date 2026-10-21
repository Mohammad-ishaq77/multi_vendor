import { EntitySchema } from "typeorm";

/**
 * Purpose-scoped one-time codes.
 *
 * A single table backs every OTP flow, but rows are always queried by
 * `purpose` (+ `orderId` for deliveries), so a registration OTP can never be
 * used to reset a password and a delivery OTP can never verify an order it was
 * not issued for. Codes and reset tokens are stored only as keyed hashes.
 */
export const OTP_PURPOSES = ["register", "password_reset", "delivery"];

export const OtpCode = new EntitySchema({
  name: "OtpCode",
  tableName: "otp_codes",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    userId: { type: "uuid", nullable: true, name: "user_id" },
    email: { type: "varchar", length: 150 },
    purpose: { type: "varchar", length: 30 },
    codeHash: { type: "varchar", length: 255, name: "code_hash" },
    orderId: { type: "uuid", nullable: true, name: "order_id" },
    attempts: { type: "int", default: 0 },
    maxAttempts: { type: "int", default: 5, name: "max_attempts" },
    expiresAt: { type: "timestamptz", name: "expires_at" },
    consumedAt: { type: "timestamptz", nullable: true, name: "consumed_at" },
    // Password-reset hand-off: a single-use token issued after a successful OTP
    // check. Stored as a hash, never in plaintext.
    resetTokenHash: { type: "varchar", length: 255, nullable: true, name: "reset_token_hash" },
    resetTokenExpiresAt: { type: "timestamptz", nullable: true, name: "reset_token_expires_at" },
    resetTokenUsedAt: { type: "timestamptz", nullable: true, name: "reset_token_used_at" },
    createdAt: { type: "timestamptz", createDate: true, name: "created_at" },
  },
});
