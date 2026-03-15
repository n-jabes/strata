"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiMap, FiLayers, FiClock, FiX } from "react-icons/fi";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: FiHome },
  { label: "Farms", href: "/farms", icon: FiLayers },
  { label: "Analyze Land", href: "/analyze-land", icon: FiMap },
  { label: "Analysis History", href: "/analysis-history", icon: FiClock },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll while mobile drawer is open
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

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Positioning: fixed on mobile (drawer), sticky on desktop
          "fixed lg:sticky top-0 left-0 z-50",
          // Size: full viewport height, fixed width
          "h-screen w-[260px] shrink-0",
          // Layout
          "flex flex-col bg-white border-r border-gray-100",
          // Mobile slide animation
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible, never translated
          "lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <Link
            href="/"
            className="text-lg font-bold text-forest tracking-tight hover:text-forest/80 transition-colors"
          >
            {APP_NAME}
          </Link>
          {/* Close button — visible only on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable navigation — takes remaining height */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {sidebarItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-forest/10 text-forest"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        "shrink-0 transition-colors duration-200",
                        isActive ? "text-forest" : "text-gray-400"
                      )}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer — always at the bottom */}
        <div className="shrink-0 px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            Smart Terraced Agriculture
            <br />
            for Africa
          </p>
        </div>
      </aside>
    </>
  );
}
