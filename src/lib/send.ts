import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const from = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

  if (!html && !text) {
    throw new Error("Either html or text must be provided");
  }

  const emailPayload: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
  } = {
    from,
    to,
    subject,
    html: html || text || "",
  };

  if (text) {
    emailPayload.text = text;
  }

  return resend.emails.send(emailPayload);
}
