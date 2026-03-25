"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiMenu, FiX } from "react-icons/fi";
import { ProfileDropdown } from "@/components/auth/profile-dropdown";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
];

const AUTH_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Farms", href: "/farms" },
  { label: "Analyze Land", href: "/analyze-land" },
  { label: "Farm Map", href: "/farm-map" },
];

const linkClass =
  "block px-3.5 py-2 text-sm font-medium text-gray-500 rounded-lg transition-all duration-200 hover:text-forest hover:bg-sand/60 whitespace-nowrap";

/**
 * Client component — reads session via useSession() so auth.ts / prisma / pg
 * never enter the browser bundle. Includes a hamburger menu for mobile.
 */
export function NavbarAuth() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  const user = session?.user;
  const navLinks = user ? AUTH_LINKS : PUBLIC_LINKS;

  const loadingPlaceholder = (
    <div className="h-8 w-24 rounded-lg bg-gray-100 animate-pulse" />
  );

  return (
    <div ref={menuRef} className="relative flex items-center">
      {/* ── Desktop navigation ──────────────────────────── */}
      <ul className="hidden md:flex items-center gap-1">
        {status === "loading" ? (
          <li>{loadingPlaceholder}</li>
        ) : (
          <>
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}

            {user ? (
              <li className="ml-2">
                <ProfileDropdown name={user.name} email={user.email} />
              </li>
            ) : (
              <>
                <li>
                  <Link href="/login" className={linkClass}>
                    Login
                  </Link>
                </li>
                <li className="ml-1">
                  <Link
                    href="/register"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest/90 hover:scale-[1.02] transition-all duration-150"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </>
        )}
      </ul>

      {/* ── Mobile hamburger button ──────────────────────── */}
      <button
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-sand/60 hover:text-forest transition-colors"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* ── Mobile dropdown panel ────────────────────────── */}
      <div
        className={cn(
          "fixed inset-x-0 top-16 z-50 bg-white border-b border-gray-100 shadow-lg md:hidden",
          "transition-all duration-200 ease-in-out origin-top",
          mobileOpen
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        )}
      >
        <nav className="px-4 py-3 flex flex-col gap-1">
          {status === "loading" ? (
            <div className="h-8 w-32 rounded-lg bg-gray-100 animate-pulse my-1" />
          ) : (
            <>
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-sand/60 hover:text-forest transition-colors"
                >
                  {label}
                </Link>
              ))}

              {user ? (
                <div className="pt-2 mt-1 border-t border-gray-100">
                  <ProfileDropdown name={user.name} email={user.email} />
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2 mt-1 border-t border-gray-100">
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-forest/40 hover:text-forest hover:bg-forest/5 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-forest rounded-lg hover:bg-forest/90 transition-colors"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
