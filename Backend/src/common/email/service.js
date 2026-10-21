import nodemailer from "nodemailer";
import { config, isMailConfigured } from "../../config/env.js";

/**
 * The single transactional-email service for NearMart.
 *
 * Gmail SMTP credentials live in the backend environment (`MAIL_USER`,
 * `MAIL_PASS`) and never reach the browser. Registration OTPs, password-reset
 * OTPs and delivery OTPs all flow through `sendMail`, but each purpose renders
 * its own branded template so an OTP for one flow can never be mistaken for
 * another.
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
  if (!isMailConfigured) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.mail.user, pass: config.mail.pass },
  });
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

/**
 * Low-level send. Callers own the templates; this only owns the transport.
 * Nothing here logs the message body, so OTP codes never reach server logs.
 */
export async function sendMail({ to, subject, html, text, replyTo }) {
  const transport = getTransporter();
  if (!transport) throw new MailNotConfiguredError();
  return transport.sendMail({
    from: `"${APP_NAME}" <${config.mail.user}>`,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
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

export async function sendRegistrationOtpEmail({ to, name, code, expiresInMinutes }) {
  return sendMail({ to, ...renderRegistrationOtpEmail({ name, code, expiresInMinutes }) });
}

export async function sendPasswordResetOtpEmail({ to, name, code, expiresInMinutes }) {
  return sendMail({ to, ...renderPasswordResetOtpEmail({ name, code, expiresInMinutes }) });
}

export async function sendDeliveryOtpEmail({ to, orderReference, code, expiresInMinutes }) {
  return sendMail({ to, ...renderDeliveryOtpEmail({ orderReference, code, expiresInMinutes }) });
}

export default { sendMail, sendRegistrationOtpEmail, sendPasswordResetOtpEmail, sendDeliveryOtpEmail, isEmailServiceReady };
