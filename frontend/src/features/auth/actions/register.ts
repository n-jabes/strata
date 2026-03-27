"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResult =
  | { ok: true }
  | { ok: false; error: string };

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const email = input.email.toLowerCase().trim();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        password: hashedPassword,
      },
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Registration failed. Please try again." };
  }
}
