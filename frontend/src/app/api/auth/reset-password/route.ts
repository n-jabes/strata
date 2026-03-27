import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/features/auth/password-reset";

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(20),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reset request." }, { status: 400 });
  }

  const ok = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  if (!ok) {
    return NextResponse.json(
      { error: "Reset token is invalid or expired." },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "Password reset successful." });
}
