"use client";

import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { Sidebar } from "@/components/layout/sidebar";
import { APP_NAME } from "@/lib/constants";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar — hidden on desktop where the sidebar is always visible */}
        <header className="lg:hidden flex items-center h-14 px-4 bg-white border-b border-gray-100 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Open navigation menu"
          >
            <FiMenu size={20} />
          </button>
          <span className="ml-3 text-base font-bold text-forest tracking-tight">
            {APP_NAME}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
