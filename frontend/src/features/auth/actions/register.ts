"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(input: RegisterInput): Promise<void> {
  const email = input.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      password: hashedPassword,
    },
  });
}
