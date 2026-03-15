import type { NextAuthConfig } from "next-auth";

const PROTECTED_PATHS = [
  "/dashboard",
  "/analyze-land",
  "/analysis-history",
  "/analysis-result",
];

/**
 * Edge-safe auth config — no Prisma, no pg, no Node.js-only imports.
 * Used by middleware (Edge Runtime) and extended by auth.ts (Node.js).
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = PROTECTED_PATHS.some((p) =>
        nextUrl.pathname.startsWith(p)
      );

      if (isProtected && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
  },
};
