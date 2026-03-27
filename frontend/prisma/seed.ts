import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const DEFAULT_SUPER_ADMIN_EMAIL = "nshutij7@gmail.com";
const DEFAULT_SUPER_ADMIN_NAME = "Super Admin";
const DEFAULT_SUPER_ADMIN_PASSWORD = "ChangeMe123!";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for seeding.");
  }

  const email = (process.env.SEED_SUPER_ADMIN_EMAIL ?? DEFAULT_SUPER_ADMIN_EMAIL)
    .trim()
    .toLowerCase();
  const name = (process.env.SEED_SUPER_ADMIN_NAME ?? DEFAULT_SUPER_ADMIN_NAME).trim();
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? DEFAULT_SUPER_ADMIN_PASSWORD;

  if (!process.env.SEED_SUPER_ADMIN_PASSWORD) {
    console.warn(
      "[seed] SEED_SUPER_ADMIN_PASSWORD not set. Using default temporary password."
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
      create: {
        name,
        email,
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log(`[seed] Super admin ready: ${user.email} (${user.role})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
