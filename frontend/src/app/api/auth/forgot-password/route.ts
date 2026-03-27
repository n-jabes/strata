import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/features/auth/password-reset";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const token = await createPasswordResetToken(parsed.data.email);

  // In production, this should be emailed to user.
  const origin = new URL(request.url).origin;
  const resetUrl = token ? `${origin}/reset-password?token=${token}` : null;

  return NextResponse.json({
    message:
      "If an account exists for that email, a password reset link has been generated.",
    resetUrl:
      process.env.NODE_ENV === "development" ? resetUrl : undefined,
  });
}
