import { z } from "zod";

export const CANCELLATION_REASONS = [
  "Ordered by mistake",
  "Found a better price",
  "Delivery is taking too long",
  "Want to change the delivery address",
  "Want to change the order or products",
  "Payment-related issue",
  "Ordered the wrong product",
  "Other",
];

export const cancellationRequestSchema = z
  .object({
    reason: z.enum(CANCELLATION_REASONS),
    details: z.string().trim().max(1000).optional().default(""),
  })
  .superRefine(({ reason, details }, context) => {
    if (reason === "Other" && !details) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["details"],
        message: "Please explain why you want to cancel this order.",
      });
    }
  });
