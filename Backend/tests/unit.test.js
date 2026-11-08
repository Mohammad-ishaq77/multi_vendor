import crypto from "crypto";
import { verifyRazorpaySignature } from "../src/modules/auth/service.js";
import { getPagination, pagedResponse } from "../src/common/utils/pagination.js";
import { slugify, hasCoords } from "../src/common/utils/helpers.js";
import { renderContactMessageEmail } from "../src/common/email/service.js";
import { contactSchema } from "../src/modules/contact/routes.js";

describe("payments signature", () => {
  test("valid signature verifies", () => {
    const secret = "test_secret";
    const orderId = "order_123";
    const paymentId = "pay_456";
    const sig = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    expect(verifyRazorpaySignature(orderId, paymentId, sig, secret)).toBe(true);
  });

  test("tampered signature fails", () => {
    expect(verifyRazorpaySignature("order_123", "pay_456", "bad", "test_secret")).toBe(false);
  });
});

describe("pagination", () => {
  test("defaults", () => {
    expect(getPagination({})).toMatchObject({ page: 1, limit: 20, skip: 0 });
  });

  test("clamps limit", () => {
    const p = getPagination({ page: "2", limit: "500" });
    expect(p).toMatchObject({ page: 2, limit: 100, skip: 100 });
  });

  test("paged response shape", () => {
    const r = pagedResponse([1, 2], 45, 1, 20);
    expect(r.ok).toBe(true);
    expect(r.pagination).toMatchObject({ page: 1, limit: 20, total: 45, pages: 3 });
  });
});

describe("helpers", () => {
  test("slugify", () => {
    expect(slugify("Fresh Basket!")).toBe("fresh-basket");
  });


  test("hasCoords", () => {
    expect(hasCoords(34.08, 74.79)).toBe(true);
    expect(hasCoords(null, 74.79)).toBe(false);
  });
});

describe("contact form", () => {
  test("renders the required subject and body fields", () => {
    const mail = renderContactMessageEmail({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+91 90000 00000",
      subject: "Bulk order",
      message: "Line one\nLine two",
      submittedAt: new Date("2026-11-08T10:30:00Z"),
    });

    expect(mail.subject).toBe("New Contact Form Message – Bulk order");
    expect(mail.text).toContain("Name: Ada Lovelace");
    expect(mail.text).toContain("Email: ada@example.com");
    expect(mail.text).toContain("Subject: Bulk order");
    expect(mail.text).toContain("Submitted:");
    expect(mail.text).toContain("Line one\nLine two");
    expect(mail.html).toContain("ada@example.com");
  });

  test("escapes HTML in visitor-supplied values", () => {
    const mail = renderContactMessageEmail({
      name: "<script>alert(1)</script>",
      email: "ada@example.com",
      subject: "Hi",
      message: "<b>bold</b>",
    });

    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("<b>bold</b>");
    expect(mail.html).toContain("&lt;script&gt;");
  });

  test("validation requires name, email and message", () => {
    expect(contactSchema.safeParse({}).success).toBe(false);
    expect(
      contactSchema.safeParse({ name: "Ada", email: "nope", message: "Hello there" }).success
    ).toBe(false);
    expect(
      contactSchema.safeParse({ name: "Ada", email: "ada@example.com", message: "Hello there" })
        .success
    ).toBe(true);
  });
});
