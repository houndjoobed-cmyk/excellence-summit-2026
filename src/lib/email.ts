import { Resend } from "resend";
import { EVENT_INFO, type Locale } from "@/data/event";
import {
  buildQrImageUrl,
  buildQrVerificationUrl,
  generateQrCodePngBuffer,
} from "@/lib/badge";

export type EmailProvider = "brevo" | "resend";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hasBrevoConfig(): boolean {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  return Boolean(apiKey && apiKey.length >= 10 && senderEmail);
}

function hasResendConfig(): boolean {
  const key = process.env.RESEND_API_KEY?.trim();
  return Boolean(key && key.startsWith("re_"));
}

function hasCustomResendSender(): boolean {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim().toLowerCase() || "";
  return Boolean(fromEmail && !fromEmail.includes("onboarding@resend.dev"));
}

/**
 * Resolves the active transactional email provider.
 * When both keys exist in auto mode, Brevo is preferred unless Resend has a verified custom domain.
 */
export function getEmailProvider(): EmailProvider | null {
  const explicit = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  const brevoReady = hasBrevoConfig();
  const resendReady = hasResendConfig();

  if (explicit === "brevo" && brevoReady) return "brevo";
  if (explicit === "resend" && resendReady) return "resend";

  if (brevoReady && !(resendReady && hasCustomResendSender())) {
    return "brevo";
  }
  if (resendReady) return "resend";
  if (brevoReady) return "brevo";
  return null;
}

export function isEmailConfigured(): boolean {
  return getEmailProvider() !== null;
}

export interface SendBadgeEmailParams {
  to: string;
  firstName: string;
  lastName: string;
  badgeCode: string;
  qrToken: string;
  locale: Locale;
  baseUrl?: string;
}

interface BuildBadgeHtmlParams {
  firstName: string;
  lastName: string;
  badgeCode: string;
  locale: Locale;
  verificationUrl: string;
  qrImageSrc: string;
}

function buildBadgeEmailHtml(params: BuildBadgeHtmlParams): string {
  const isEn = params.locale === "en";
  const fullName = escapeHtml(`${params.firstName} ${params.lastName}`);
  const safeCode = escapeHtml(params.badgeCode);
  const safeUrl = escapeHtml(params.verificationUrl);
  const safeQrSrc = escapeHtml(params.qrImageSrc);

  return `
<!DOCTYPE html>
<html lang="${isEn ? "en" : "fr"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f5f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#071338;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e6f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#041247 0%,#072078 100%);padding:32px 28px;text-align:center;border-bottom:3px solid #f3c638;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#fde073;font-weight:700;">
                ${escapeHtml(EVENT_INFO.organizer)}
              </p>
              <h1 style="margin:0;font-size:28px;color:#ffffff;font-family:Georgia,serif;">
                Excellence Summit 2026
              </h1>
              <p style="margin:8px 0 0;font-size:14px;color:#dbe4ff;">
                ${isEn ? "1st Convention · Masterclasses Pass" : "1re Convention · Pass Masterclasses"}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 12px;font-size:16px;">
                ${isEn ? `Hello <strong>${fullName}</strong>,` : `Bonjour <strong>${fullName}</strong>,`}
              </p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#394366;">
                ${
                  isEn
                    ? "Your registration for the Excellence Summit 2026 Masterclasses is confirmed. Present the QR code or reference number below at the entrance."
                    : "Votre inscription aux Masterclasses d'Excellence Summit 2026 est confirmée. Présentez ce QR code ou votre numéro de référence à l'accueil."
                }
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#041247;border-radius:12px;border:1px solid #f3c638;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#fde073;">
                      ${isEn ? "REGISTRATION NUMBER" : "NUMÉRO D'INSCRIPTION"}
                    </p>
                    <p style="margin:0 0 18px;font-size:26px;font-weight:700;letter-spacing:2px;color:#ffffff;font-family:monospace;">
                      ${safeCode}
                    </p>
                    <img src="${safeQrSrc}" alt="QR Code ${safeCode}" width="180" height="180" style="display:block;margin:0 auto;border-radius:10px;background:#ffffff;padding:8px;" />
                    <p style="margin:16px 0 0;font-size:12px;color:#dbe4ff;">
                      ${isEn ? "Dec 01 – 06, 2026 · Cité d'Excellence & Majestic Cadjehoun" : "01 – 06 Déc. 2026 · Cité d'Excellence & Majestic Cadjehoun"}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;text-align:center;">
                <a href="${safeUrl}" style="display:inline-block;background:#f3c638;color:#041247;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:999px;">
                  ${isEn ? "Open my badge online" : "Ouvrir mon badge en ligne"}
                </a>
              </p>

              <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#5d6685;border-top:1px solid #e6e9f2;padding-top:16px;">
                <strong>${isEn ? "Venues:" : "Lieux :"}</strong> ${escapeHtml(EVENT_INFO.venues.primary.address[params.locale])} · ${escapeHtml(EVENT_INFO.venues.sunday.address[params.locale])}<br/>
                <strong>Contacts :</strong> +229 0196 320 444 / +229 01 65 185 630
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

async function sendViaBrevo(
  params: SendBadgeEmailParams,
  subject: string,
  verificationUrl: string,
  qrBuffer: Buffer,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.BREVO_API_KEY!.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL!.trim();
  const senderName =
    process.env.BREVO_SENDER_NAME?.trim() || "Excellence Summit 2026";

  const qrImageSrc = buildQrImageUrl(
    params.badgeCode,
    params.qrToken,
    params.baseUrl,
  );
  const htmlContent = buildBadgeEmailHtml({
    firstName: params.firstName,
    lastName: params.lastName,
    badgeCode: params.badgeCode,
    locale: params.locale,
    verificationUrl,
    qrImageSrc,
  });

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        replyTo: { name: senderName, email: senderEmail },
        to: [
          {
            email: params.to,
            name: `${params.firstName} ${params.lastName}`.trim(),
          },
        ],
        subject,
        htmlContent,
        attachment: [
          {
            name: `badge-${params.badgeCode}.png`,
            content: qrBuffer.toString("base64"),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        `[Brevo] failed to send badge email (HTTP ${response.status}):`,
        errorText,
      );
      return { sent: false, reason: "BREVO_ERROR" };
    }

    return { sent: true };
  } catch (err) {
    console.error("[Brevo] exception while sending badge email:", err);
    return { sent: false, reason: "BREVO_EXCEPTION" };
  }
}

async function sendViaResend(
  params: SendBadgeEmailParams,
  subject: string,
  verificationUrl: string,
  qrBuffer: Buffer,
): Promise<{ sent: boolean; reason?: string }> {
  const resend = new Resend(process.env.RESEND_API_KEY!.trim());
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Excellence Summit <onboarding@resend.dev>";

  const html = buildBadgeEmailHtml({
    firstName: params.firstName,
    lastName: params.lastName,
    badgeCode: params.badgeCode,
    locale: params.locale,
    verificationUrl,
    qrImageSrc: "cid:badge-qr",
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [params.to],
      subject,
      html,
      attachments: [
        {
          filename: `badge-${params.badgeCode}.png`,
          content: qrBuffer,
          contentId: "badge-qr",
        },
      ],
    });

    if (result.error) {
      console.error("[Resend] failed to send badge email:", result.error);
      return { sent: false, reason: "RESEND_ERROR" };
    }
    return { sent: true };
  } catch (err) {
    console.error("[Resend] exception while sending badge email:", err);
    return { sent: false, reason: "RESEND_EXCEPTION" };
  }
}

export async function sendBadgeEmail(
  params: SendBadgeEmailParams,
): Promise<{ sent: boolean; reason?: string }> {
  const provider = getEmailProvider();
  if (!provider) {
    return { sent: false, reason: "EMAIL_NOT_CONFIGURED" };
  }

  const verificationUrl = buildQrVerificationUrl(
    params.badgeCode,
    params.qrToken,
    params.baseUrl,
  );
  const qrBuffer = await generateQrCodePngBuffer(verificationUrl);
  const subject =
    params.locale === "en"
      ? `Your Official QR Badge (${params.badgeCode}) — Excellence Summit 2026`
      : `Votre Badge QR Officiel (${params.badgeCode}) — Excellence Summit 2026`;

  if (provider === "brevo") {
    return sendViaBrevo(params, subject, verificationUrl, qrBuffer);
  }
  return sendViaResend(params, subject, verificationUrl, qrBuffer);
}
