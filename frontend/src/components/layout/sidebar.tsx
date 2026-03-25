"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LuLayoutDashboard,
  LuMap,
  LuMapPin,
  LuHistory,
  LuTractor,
  LuX,
  LuLogOut,
} from "react-icons/lu";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LuLayoutDashboard;
  /** Extra path prefixes that should mark this item active */
  activePrefixes?: string[];
};

const sidebarItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
  { label: "Farms", href: "/farms", icon: LuTractor },
  { label: "Analyze Land", href: "/analyze-land", icon: LuMap },
  { label: "Farm Map", href: "/farm-map", icon: LuMapPin },
  {
    label: "Analysis History",
    href: "/analysis-history",
    icon: LuHistory,
    activePrefixes: ["/analysis-result"],
  },
];

function navIsActive(
  pathname: string,
  href: string,
  activePrefixes?: string[]
) {
  if (pathname === href) return true;
  if (pathname.startsWith(`${href}/`)) return true;
  if (activePrefixes?.some((p) => pathname.startsWith(p))) return true;
  return false;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    void signOut({ callbackUrl: "/" });
  };

  const user = session?.user;
  const displayName = user?.name?.split(" ")[0] ?? "Farmer";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-sidebar-bg/60 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50",
          "h-[100dvh] w-[min(18rem,88vw)] sm:w-[17.5rem] shrink-0",
          "flex flex-col",
          "bg-gradient-to-b from-sidebar-bg via-sidebar-bg to-[#0f0d0a]",
          "border-r border-sidebar-border shadow-[4px_0_24px_rgba(0,0,0,0.12)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Top accent — soil strip */}
        <div
          className="h-1 w-full shrink-0 bg-gradient-to-r from-soil via-forest to-leaf opacity-90"
          aria-hidden
        />

        <div className="flex h-[3.75rem] items-center justify-between gap-2 px-5 border-b border-sidebar-border shrink-0">
          <Link
            href="/dashboard"
            onClick={() => onClose()}
            className="group min-w-0"
          >
            <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-soil/70 group-hover:text-soil transition-colors">
              Workspace
            </span>
            <span className="block text-lg font-bold tracking-tight text-white/95 group-hover:text-white truncate">
              {APP_NAME}
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <LuX className="size-[1.125rem]" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 min-h-0">
          <p className="px-3 mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white/35">
            Navigate
          </p>
          <ul className="space-y-1">
            {sidebarItems.map(
              ({ label, href, icon: Icon, activePrefixes }) => {
                const isActive = navIsActive(
                  pathname,
                  href,
                  activePrefixes
                );
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => onClose()}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "text-white bg-white/[0.08] shadow-[inset_3px_0_0_0_var(--color-soil)]"
                          : "text-white/55 hover:text-white/90 hover:bg-white/[0.05]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
                          isActive
                            ? "border-soil/40 bg-soil/15 text-soil"
                            : "border-white/10 bg-white/[0.04] text-white/45 group-hover:border-white/15 group-hover:text-soil/90"
                        )}
                      >
                        <Icon className="size-[1.125rem]" strokeWidth={1.75} />
                      </span>
                      {label}
                    </Link>
                  </li>
                );
              }
            )}
          </ul>
        </nav>

        <div className="shrink-0 p-4 pt-2 border-t border-sidebar-border space-y-3 bg-black/20">
          {user && (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
              <p className="text-xs font-medium text-white/90 truncate">
                {user.name ?? displayName}
              </p>
              {user.email && (
                <p className="text-[0.7rem] text-white/40 truncate mt-0.5">
                  {user.email}
                </p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/[0.12] px-3 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/20 hover:border-red-400/35 transition-colors"
          >
            <LuLogOut className="size-4 shrink-0" strokeWidth={2} />
            Log out
          </button>
          <p className="text-center text-[0.65rem] text-white/30 leading-relaxed px-1">
            Smart terraced agriculture for Africa
          </p>
        </div>
      </aside>
    </>
  );
}
