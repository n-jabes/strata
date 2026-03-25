import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe: authConfig only — no Prisma/pg. Default export required by Next.js middleware.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
