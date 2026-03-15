import Link from "next/link";
import { Container } from "@/components/ui/container";
import { NavbarAuth } from "@/components/auth/navbar-auth";
import { APP_NAME } from "@/lib/constants";

/**
 * Static server component — renders the logo and delegates all
 * auth-dependent navigation to NavbarAuth (client component).
 * No auth.ts / prisma.ts imports here keeps pg out of the browser bundle.
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-8">
          <Link
            href="/"
            className="text-xl font-bold text-forest tracking-tight shrink-0 hover:text-forest/80 transition-colors duration-200"
          >
            {APP_NAME}
          </Link>

          <NavbarAuth />
        </nav>
      </Container>
    </header>
  );
}
