import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/features/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

function resolveAppOrigin(request: Request): string {
  const fromEnv =
    process.env.AUTH_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return new URL(request.url).origin;
}

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const clientIp = getClientIp(request);
  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const perIp = checkRateLimit({
    key: `forgot-password:ip:${clientIp}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (!perIp.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(perIp.retryAfterSeconds) },
      }
    );
  }

  const perEmail = checkRateLimit({
    key: `forgot-password:email:${normalizedEmail}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!perEmail.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(perEmail.retryAfterSeconds) },
      }
    );
  }

  const token = await createPasswordResetToken(normalizedEmail);

  const origin = resolveAppOrigin(request);
  const resetUrl = token ? `${origin}/reset-password?token=${token}` : null;

  if (token) {
    await sendPasswordResetEmail({
      to: normalizedEmail,
      token,
      baseUrl: origin,
    });
  }
  const shouldExposeResetUrl =
    process.env.NODE_ENV !== "production" &&
    process.env.EXPOSE_RESET_LINKS === "true";

  return NextResponse.json({
    message:
      "If an account exists for that email, a password reset link has been generated.",
    resetUrl: shouldExposeResetUrl ? resetUrl : undefined,
  });
}
