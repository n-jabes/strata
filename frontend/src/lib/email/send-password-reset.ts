import { Resend } from "resend";
import { APP_NAME } from "@/lib/constants";

export async function sendPasswordResetEmail(args: {
  to: string;
  token: string;
  baseUrl: string;
}): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    console.warn(
      "[email] RESEND_API_KEY or RESEND_FROM not set; password reset email not sent."
    );
    return { ok: false };
  }

  const origin = args.baseUrl.replace(/\/$/, "");
  const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(args.token)}`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: `Reset your ${APP_NAME} password`,
    text: `You requested a password reset for ${APP_NAME}.\n\nOpen this link to choose a new password (it expires in 30 minutes):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <p>You requested a password reset for <strong>${APP_NAME}</strong>.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 30 minutes. If you did not request a reset, you can ignore this email.</p>
    `.trim(),
  });

  if (error) {
    console.error("[email] Resend send failed:", error);
    return { ok: false };
  }

  return { ok: true };
}
