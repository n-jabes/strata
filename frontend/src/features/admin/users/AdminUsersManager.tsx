"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "FARMER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

type AdminUsersManagerProps = {
  initialUsers: UserRow[];
  currentUserId: string;
};

const ROLE_OPTIONS = [
  { value: "FARMER", label: "Farmer" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
] as const;

export function AdminUsersManager({
  initialUsers,
  currentUserId,
}: AdminUsersManagerProps) {
  const PAGE_SIZE = 8;
  const [users, setUsers] = useState(initialUsers);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingChange, setPendingChange] = useState<{
    userId: string;
    userName: string;
    previousRole: UserRow["role"];
    nextRole: UserRow["role"];
  } | null>(null);

  useEffect(() => {
    if (!error) return;

    const timer = window.setTimeout(() => {
      setError(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [error]);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        const roleWeight = (role: UserRow["role"]) =>
          role === "SUPER_ADMIN" ? 3 : role === "ADMIN" ? 2 : 1;
        const roleDiff = roleWeight(b.role) - roleWeight(a.role);
        if (roleDiff !== 0) return roleDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }),
    [users]
  );
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedUsers.slice(start, start + PAGE_SIZE);
  }, [sortedUsers, currentPage]);

  async function handleRoleChange(userId: string, nextRole: UserRow["role"]) {
    setError(null);
    setSavingUserId(userId);
    const previous = users;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
    );

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        role?: UserRow["role"];
      };

      if (!res.ok) {
        throw new Error(json.error ?? `Failed (${res.status})`);
      }

      if (json.role) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: json.role! } : u))
        );
      }
    } catch (e) {
      setUsers(previous);
      setError(e instanceof Error ? e.message : "Could not update role.");
    } finally {
      setSavingUserId(null);
    }
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  function requestRoleChange(user: UserRow, nextRole: UserRow["role"]) {
    if (nextRole === user.role) return;
    setError(null);
    setPendingChange({
      userId: user.id,
      userName: user.name,
      previousRole: user.role,
      nextRole,
    });
  }

  async function confirmRoleChange() {
    if (!pendingChange) return;
    const { userId, nextRole } = pendingChange;
    setPendingChange(null);
    await handleRoleChange(userId, nextRole);
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">User Role Management</h2>
        <p className="mt-1 text-xs text-gray-500">
          Assign and maintain platform roles with guardrails.
        </p>
      </div>

      {error ? (
        <div
          className="mx-5 mt-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="rounded p-0.5 text-red-700/80 hover:bg-red-100 hover:text-red-800"
            aria-label="Dismiss error message"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="p-4 md:hidden">
        <div className="space-y-3">
          {paginatedUsers.map((user) => (
            <article
              key={user.id}
              className="rounded-xl border border-gray-100 bg-[#fcfdfc] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                {user.id === currentUserId ? (
                  <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-semibold text-forest">
                    You
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Joined</p>
                  <p className="text-xs text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="min-w-[150px]">
                  <label className="sr-only" htmlFor={`role-mobile-${user.id}`}>
                    Role for {user.name}
                  </label>
                  <select
                    id={`role-mobile-${user.id}`}
                    value={user.role}
                    onChange={(e) =>
                      requestRoleChange(user, e.target.value as UserRow["role"])
                    }
                    disabled={savingUserId === user.id}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-forest focus:shadow-[inset_0_0_0_1px_#007E6E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto p-4 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                User
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Email
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Role
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 last:border-0">
                <td className="px-3 py-3 font-medium text-gray-900">
                  {user.name}
                  {user.id === currentUserId ? (
                    <span className="ml-2 rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-semibold text-forest">
                      You
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-gray-600">{user.email}</td>
                <td className="px-3 py-3">
                  <label className="sr-only" htmlFor={`role-${user.id}`}>
                    Role for {user.name}
                  </label>
                  <select
                    id={`role-${user.id}`}
                    value={user.role}
                    onChange={(e) =>
                      requestRoleChange(user, e.target.value as UserRow["role"])
                    }
                    disabled={savingUserId === user.id}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-forest focus:shadow-[inset_0_0_0_1px_#007E6E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            {sortedUsers.length === 0
              ? "No users found."
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPage * PAGE_SIZE,
                  sortedUsers.length
                )} of ${sortedUsers.length} users`}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="secondary"
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs"
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700">
              Page {currentPage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs"
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
        <p>
          Best-practice safeguards are enforced: no self demotion from Super Admin
          and no removal of the last Super Admin account.
        </p>
      </div>

      {pendingChange ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1a1612]/10 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Confirm role change</h3>
            <p className="mt-2 text-sm text-gray-600">
              You are about to change{" "}
              <span className="font-semibold text-gray-900">{pendingChange.userName}</span>
              {" "}from{" "}
              <span className="font-semibold text-gray-900">
                {pendingChange.previousRole.replace("_", " ")}
              </span>
              {" "}to{" "}
              <span className="font-semibold text-gray-900">
                {pendingChange.nextRole.replace("_", " ")}
              </span>
              .
            </p>
            <p className="mt-1 text-xs text-gray-500">
              This action affects platform access immediately after session refresh.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPendingChange(null)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => void confirmRoleChange()}>
                Yes, change role
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
