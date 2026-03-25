"use client";

import { useState } from "react";
import { LuPanelLeft } from "react-icons/lu";
import { Sidebar } from "@/components/layout/sidebar";
import { APP_NAME } from "@/lib/constants";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-[100dvh] overflow-hidden bg-sand/20">
      {/* Unified earth/soil background for all dashboard pages */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_rgba(215,193,151,0.55),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(115,175,111,0.22),transparent_45%),linear-gradient(to_bottom,rgba(215,193,151,0.15),rgba(255,255,255,0))]"
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-18 shrink-0 items-center gap-3 border-b border-sidebar-border bg-sidebar-bg px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl text-soil/90 hover:bg-white/10 hover:text-soil transition-colors"
            aria-label="Open navigation menu"
          >
            <LuPanelLeft className="size-5" strokeWidth={1.75} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-soil/60">
              STRATA
            </p>
            <p className="truncate text-sm font-bold text-white/95">
              {APP_NAME}
            </p>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
