"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiMap, FiLayers, FiBarChart2 } from "react-icons/fi";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: FiHome },
  { label: "Analyze Land", href: "/dashboard/analyze", icon: FiMap },
  { label: "My Farms", href: "/dashboard/farms", icon: FiLayers },
  { label: "Recommendations", href: "/dashboard/recommendations", icon: FiBarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-gray-100 bg-white min-h-screen">
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <Link
          href="/"
          className="text-lg font-bold text-forest tracking-tight hover:text-forest-dark transition-colors"
        >
          {APP_NAME}
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {sidebarItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
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

      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          Smart Terraced Agriculture
          <br />
          for Africa
        </p>
      </div>
    </aside>
  );
}
