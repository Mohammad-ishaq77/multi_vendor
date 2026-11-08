import nodemailer from "nodemailer";
import { config, isMailConfigured } from "../../config/env.js";

/**
 * The single transactional-email service for NearMart.
 *
 * Credentials live in the backend environment (`SMTP_*` / `RESEND_API_KEY`)
 * and never reach the browser. Registration OTPs, password-reset OTPs,
 * delivery OTPs and contact-form messages all flow through `sendMail`, but each
 * purpose renders its own branded template so an OTP for one flow can never be
 * mistaken for another.
 */

const APP_NAME = "NearMart";

const COLORS = {
  primary: "#047857",
  primaryDark: "#064E3B",
  greenBg: "#ECFDF5",
  border: "#D1FAE5",
  text: "#042F2E",
  muted: "#3F5B54",
};

let transporter = null;

function getTransporter() {
  if (!isMailConfigured || config.mail.provider !== "smtp") return null;
  if (transporter) return transporter;
  const { smtp } = config.mail;
  const timeouts = {
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  };
  transporter = nodemailer.createTransport(
    smtp.host
      ? {
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          ...timeouts,
          ...(smtp.user ? { auth: { user: smtp.user, pass: smtp.pass } } : {}),
        }
      : {
          // Legacy Gmail path: MAIL_USER + MAIL_PASS (App Password).
          service: "gmail",
          ...timeouts,
          auth: { user: smtp.user, pass: smtp.pass },
        }
  );
  return transporter;
}

export const isEmailServiceReady = () => isMailConfigured;

export class MailNotConfiguredError extends Error {
  constructor() {
    super("Email service is not configured.");
    this.name = "MailNotConfiguredError";
    this.code = "MAIL_NOT_CONFIGURED";
  }
}

export class MailDeliveryError extends Error {
  constructor(message, { cause } = {}) {
    super(message || "Email delivery failed.", { cause });
    this.name = "MailDeliveryError";
    this.code = "MAIL_DELIVERY_FAILED";
    this.status = 502;
  }
}

/**
 * Send through Resend's HTTP API. Used when `RESEND_API_KEY` is configured so
 * delivery does not depend on a local SMTP server being reachable.
 */
async function sendViaResend({ from, to, subject, html, text, replyTo }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.mail.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new MailDeliveryError(
        payload?.message || `Resend rejected the email (HTTP ${response.status}).`
      );
    }
    return payload;
  } catch (error) {
    if (error instanceof MailDeliveryError) throw error;
    throw new MailDeliveryError(
      error?.name === "AbortError"
        ? "The email provider timed out."
        : error?.message || "Email delivery failed.",
      { cause: error }
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Low-level send. Callers own the templates; this only owns the transport.
 * Nothing here logs the message body, so OTP codes never reach server logs.
 * Resolves only once the provider has accepted the message for delivery.
 */
export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!isMailConfigured) throw new MailNotConfiguredError();
  const from = `"${config.mail.senderName}" <${config.mail.senderEmail}>`;

  if (config.mail.provider === "resend") {
    return sendViaResend({ from, to, subject, html, text, replyTo });
  }

  const transport = getTransporter();
  if (!transport) throw new MailNotConfiguredError();
  try {
    return await transport.sendMail({
      from,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
  } catch (error) {
    throw new MailDeliveryError(error?.message, { cause: error });
  }
}

/** Escape user-supplied values before they are interpolated into HTML. */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Branded HTML shell shared by every transactional email. */
function renderShell({ heading, intro, bodyHtml, footer }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:${COLORS.greenBg};font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.greenBg};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:${COLORS.primaryDark};padding:20px 28px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.3px;">${APP_NAME}</span>
                <span style="color:#A7F3D0;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;display:block;margin-top:2px;">Local Marketplace</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 12px;font-size:20px;color:${COLORS.text};">${heading}</h1>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${COLORS.muted};">${intro}</p>
                ${bodyHtml}
                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:${COLORS.muted};">${footer}</p>
              </td>
            </tr>
          </table>
          <p style="max-width:520px;margin:16px auto 0;font-size:11px;color:${COLORS.muted};text-align:center;">
            This is an automated message from ${APP_NAME}. Please do not reply.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderCodeBlock(code) {
  return `<div style="text-align:center;margin:8px 0 4px;">
    <div style="display:inline-block;background:${COLORS.greenBg};border:1px solid ${COLORS.border};border-radius:12px;padding:16px 24px;">
      <span style="font-size:32px;font-weight:700;letter-spacing:10px;color:${COLORS.primaryDark};">${code}</span>
    </div>
  </div>`;
}

export function renderRegistrationOtpEmail({ name, code, expiresInMinutes }) {
  return {
    subject: `Your ${APP_NAME} verification code`,
    html: renderShell({
      heading: "Verify your email address",
      intro: `Hi ${name || "there"}, use the code below to verify your email and finish creating your ${APP_NAME} account.`,
      bodyHtml: renderCodeBlock(code),
      footer: `This code expires in ${expiresInMinutes} minutes. If you did not create a ${APP_NAME} account, you can safely ignore this email.`,
    }),
    text: `Your ${APP_NAME} verification code is ${code}. It expires in ${expiresInMinutes} minutes.`,
  };
}

export function renderPasswordResetOtpEmail({ name, code, expiresInMinutes }) {
  return {
    subject: `Your ${APP_NAME} password reset code`,
    html: renderShell({
      heading: "Reset your password",
      intro: `Hi ${name || "there"}, use the code below to confirm it's you and set a new password.`,
      bodyHtml: renderCodeBlock(code),
      footer: `This code expires in ${expiresInMinutes} minutes. If you did not request a password reset, ignore this email and your password will stay unchanged.`,
    }),
    text: `Your ${APP_NAME} password reset code is ${code}. It expires in ${expiresInMinutes} minutes.`,
  };
}

export function renderDeliveryOtpEmail({ orderReference, code, expiresInMinutes }) {
  return {
    subject: `Your ${APP_NAME} delivery verification code`,
    html: renderShell({
      heading: "Confirm your delivery",
      intro: `Your order <strong>${orderReference}</strong> is at your door. Share the code below with the delivery partner to confirm you received it.`,
      bodyHtml: renderCodeBlock(code),
      footer: `This code expires in ${expiresInMinutes} minutes. Only share it with the authorized ${APP_NAME} delivery partner at the time of delivery. Never share it with anyone else.`,
    }),
    text: `Your ${APP_NAME} delivery code for order ${orderReference} is ${code}. It expires in ${expiresInMinutes} minutes. Only share it with the authorized delivery partner at delivery.`,
  };
}

/** Format a timestamp for humans, in the marketplace's local timezone. */
function formatSubmittedAt(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "Unknown";
  try {
    return `${new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(date)} IST`;
  } catch {
    return date.toISOString();
  }
}

export function renderContactMessageEmail({
  name,
  email,
  phone,
  subject,
  message,
  submittedAt,
}) {
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    phone: escapeHtml(phone),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replace(/\r?\n/g, "<br />"),
  };
  const submitted = formatSubmittedAt(submittedAt);
  return {
    subject: `New Contact Form Message – ${safe.subject}`,
    html: renderShell({
      heading: "New contact form message",
      intro: `A visitor submitted the contact form on ${APP_NAME}. Reply directly to this email to reach them.`,
      bodyHtml: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.greenBg};border:1px solid ${COLORS.border};border-radius:12px;padding:0;margin:0 0 4px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:13px;color:${COLORS.muted};"><strong>Name:</strong> ${safe.name}</p>
          <p style="margin:0 0 8px;font-size:13px;color:${COLORS.muted};"><strong>Email:</strong> ${safe.email}</p>
          ${phone ? `<p style="margin:0 0 8px;font-size:13px;color:${COLORS.muted};"><strong>Phone:</strong> ${safe.phone}</p>` : ""}
          <p style="margin:0 0 8px;font-size:13px;color:${COLORS.muted};"><strong>Subject:</strong> ${safe.subject}</p>
          <p style="margin:0;font-size:13px;color:${COLORS.muted};"><strong>Submitted:</strong> ${escapeHtml(submitted)}</p>
        </td></tr>
      </table>
      <div style="margin:20px 0 0;padding:16px 20px;border:1px solid ${COLORS.border};border-radius:12px;">
        <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.muted};"><strong>Message</strong></p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:${COLORS.text};">${safe.message}</p>
      </div>`,
      footer: `Sent from the ${APP_NAME} website contact form on ${escapeHtml(submitted)}. Replying to this email will write back to ${safe.email}.`,
    }),
    text: `New Contact Form Message – ${subject}\n\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ""}\nSubject: ${subject}\nSubmitted: ${submitted}\n\n${message}`,
  };
}

export async function sendRegistrationOtpEmail({ to, name, code, expiresInMinutes }) {
  return sendMail({ to, ...renderRegistrationOtpEmail({ name, code, expiresInMinutes }) });
}

export async function sendPasswordResetOtpEmail({ to, name, code, expiresInMinutes }) {
  return sendMail({ to, ...renderPasswordResetOtpEmail({ name, code, expiresInMinutes }) });
}

export async function sendDeliveryOtpEmail({ to, orderReference, code, expiresInMinutes }) {
  return sendMail({ to, ...renderDeliveryOtpEmail({ orderReference, code, expiresInMinutes }) });
}

/**
 * Deliver a public contact-form submission to the NearMart inbox. `replyTo`
 * points at the visitor so the team can answer straight from the mailbox.
 */
export async function sendContactMessageEmail({
  name,
  email,
  phone,
  subject,
  message,
  submittedAt = new Date(),
}) {
  const to = config.mail.contactTo;
  if (!to) throw new MailNotConfiguredError();
  return sendMail({
    to,
    replyTo: email,
    ...renderContactMessageEmail({ name, email, phone, subject, message, submittedAt }),
  });
}

export default {
  sendMail,
  sendRegistrationOtpEmail,
  sendPasswordResetOtpEmail,
  sendDeliveryOtpEmail,
  sendContactMessageEmail,
  isEmailServiceReady,
};
