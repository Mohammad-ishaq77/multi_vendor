import { jest } from "@jest/globals";

const sendContactMessageEmail = jest.fn();

jest.unstable_mockModule("../src/common/email/service.js", () => ({
  MailNotConfiguredError: class MailNotConfiguredError extends Error {
    constructor() {
      super("Email service is not configured.");
      this.name = "MailNotConfiguredError";
      this.code = "MAIL_NOT_CONFIGURED";
    }
  },
  MailDeliveryError: class MailDeliveryError extends Error {
    constructor(message, { cause } = {}) {
      super(message, { cause });
      this.name = "MailDeliveryError";
      this.code = "MAIL_DELIVERY_FAILED";
      this.status = 502;
    }
  },
  sendContactMessageEmail,
  sendRegistrationOtpEmail: jest.fn(),
  sendPasswordResetOtpEmail: jest.fn(),
  sendDeliveryOtpEmail: jest.fn(),
  isEmailServiceReady: () => false,
}));

const { default: request } = await import("supertest");
const { buildApp } = await import("../src/index.js");

const app = buildApp();

const validMessage = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Bulk order enquiry",
  message: "Hello, I would like to place a bulk order.",
};

beforeEach(() => {
  sendContactMessageEmail.mockReset();
});

describe("POST /api/contact", () => {
  test("rejects empty or invalid submissions without sending email", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "A", email: "not-an-email", message: "hi" });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(Array.isArray(res.body.issues)).toBe(true);
    expect(sendContactMessageEmail).not.toHaveBeenCalled();
  });

  test("returns success only after the email provider accepts the message", async () => {
    sendContactMessageEmail.mockResolvedValue({ id: "email_123" });

    const res = await request(app).post("/api/contact").send(validMessage);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(sendContactMessageEmail).toHaveBeenCalledTimes(1);
    expect(sendContactMessageEmail.mock.calls[0][0]).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      subject: "Bulk order enquiry",
    });
  });

  test("falls back to a default subject when none is supplied", async () => {
    sendContactMessageEmail.mockResolvedValue({ id: "email_124" });

    const res = await request(app)
      .post("/api/contact")
      .send({ ...validMessage, subject: "" });

    expect(res.status).toBe(200);
    expect(sendContactMessageEmail.mock.calls[0][0].subject).toBe("General enquiry");
  });

  test("returns 502 when email delivery fails (never a fake success)", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    sendContactMessageEmail.mockRejectedValue(new Error("provider unavailable"));

    const res = await request(app).post("/api/contact").send(validMessage);

    expect(res.status).toBe(502);
    expect(res.body.ok).toBe(false);
    expect(sendContactMessageEmail).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });
});
