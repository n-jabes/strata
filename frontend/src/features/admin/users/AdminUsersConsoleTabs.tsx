"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/fade-in";
import { AdminUsersManager } from "@/features/admin/users/AdminUsersManager";
import { RoleChangeAuditSection } from "@/features/admin/users/RoleChangeAuditSection";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "FARMER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

type AuditRow = {
  id: string;
  fromRole: string;
  toRole: string;
  createdAt: string;
  actor: { name: string; email: string };
  target: { name: string; email: string };
};

type AdminUsersConsoleTabsProps = {
  currentUserId: string;
  initialUsers: UserRow[];
  audits: AuditRow[];
};

export function AdminUsersConsoleTabs({
  currentUserId,
  initialUsers,
  audits,
}: AdminUsersConsoleTabsProps) {
  const [activeTab, setActiveTab] = useState<"roles" | "audits">("roles");

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/60 p-2.5 shadow-sm backdrop-blur">
      <div className="px-2.5 pt-2">
        <div
          role="tablist"
          aria-label="Admin console sections"
          className="flex items-center gap-2 overflow-x-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "roles"}
            className="relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold outline-none transition-colors"
            onClick={() => setActiveTab("roles")}
          >
            {activeTab === "roles" ? (
              <motion.span
                layoutId="admin-console-tab-indicator"
                className="absolute inset-0 -z-10 rounded-xl bg-forest/10"
              />
            ) : null}
            <span className={activeTab === "roles" ? "text-gray-900" : "text-gray-500"}>
              Role management
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "audits"}
            className="relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold outline-none transition-colors"
            onClick={() => setActiveTab("audits")}
          >
            {activeTab === "audits" ? (
              <motion.span
                layoutId="admin-console-tab-indicator"
                className="absolute inset-0 -z-10 rounded-xl bg-emerald-600/10"
              />
            ) : null}
            <span className={activeTab === "audits" ? "text-gray-900" : "text-gray-500"}>
              Audit log
            </span>
          </button>
        </div>
      </div>

      <div className="mt-2.5 px-2.5 pb-2.5">
        <FadeIn key={activeTab} delay={0.05}>
          {activeTab === "roles" ? (
            <AdminUsersManager initialUsers={initialUsers} currentUserId={currentUserId} />
          ) : (
            <RoleChangeAuditSection audits={audits} />
          )}
        </FadeIn>
      </div>
    </div>
  );
}

