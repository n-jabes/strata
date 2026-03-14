import Link from "next/link";
import { FiUser } from "react-icons/fi";
import { Container } from "@/components/ui/container";
import { APP_NAME, PUBLIC_NAV_LINKS, AUTH_NAV_LINKS } from "@/lib/constants";

// Replace with real auth check when authentication is implemented
const isAuthenticated = false;

export function Navbar() {
  const navLinks = isAuthenticated ? AUTH_NAV_LINKS : PUBLIC_NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-8">
          <Link
            href="/"
            className="text-xl font-bold text-forest tracking-tight shrink-0 hover:text-forest-dark transition-colors duration-200"
          >
            {APP_NAME}
          </Link>

          <ul className="flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="px-3.5 py-2 text-sm font-medium text-gray-500 rounded-lg transition-all duration-200 hover:text-forest hover:bg-sand/60 whitespace-nowrap"
                >
                  {label}
                </Link>
              </li>
            ))}

            {isAuthenticated ? (
              <li className="ml-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/10 text-forest hover:bg-forest/20 transition-colors duration-200">
                  <FiUser size={16} />
                </button>
              </li>
            ) : (
              <li className="ml-2">
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest-dark transition-colors duration-200"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
