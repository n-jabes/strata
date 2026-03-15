import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Use the edge-safe config so no pg/Prisma code is bundled for Edge Runtime.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
