import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { httpError } from "../../common/middleware/error.js";
import { contactLimiter } from "../../common/middleware/rateLimit.js";
import { validate } from "../../common/middleware/validate.js";
import {
  MailNotConfiguredError,
  sendContactMessageEmail,
} from "../../common/email/service.js";

const router = Router();

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(20).optional().default(""),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(5).max(5000),
  // Honeypot: real users never see or fill this field. Bots that do are rejected.
  _honey: z.string().max(0, "Spam detected.").optional().default(""),
});

/**
 * @openapi
 * /api/contact:
 *   post:
 *     tags: [Contact]
 *     summary: Send a public contact-form message to the NearMart inbox
 *     responses: { 200: { description: Message delivered }, 502: { description: Email delivery failed } }
 */
router.post(
  "/",
  contactLimiter,
  validate({ body: contactSchema }),
  asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    try {
      // Resolves only once the provider has accepted the message for delivery.
      await sendContactMessageEmail({
        name,
        email,
        phone,
        subject: subject || "General enquiry",
        message,
        submittedAt: new Date(),
      });
    } catch (error) {
      if (error instanceof MailNotConfiguredError) {
        console.error("Contact form unavailable: email service is not configured.");
        throw httpError(503, "The contact form is temporarily unavailable. Please try again later.");
      }
      console.error("Contact form email delivery failed:", error);
      throw httpError(502, "We could not send your message right now. Please try again shortly.");
    }
    res.json({ ok: true, message: "Your message has been sent. We'll get back to you shortly." });
  })
);

export default router;
