"use client";

import { useMemo, useState } from "react";
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
  const [users, setUsers] = useState(initialUsers);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">User Role Management</h2>
        <p className="mt-1 text-xs text-gray-500">
          Assign and maintain platform roles with guardrails.
        </p>
      </div>

      {error ? (
        <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto p-4">
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
            {sortedUsers.map((user) => (
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
                      void handleRoleChange(
                        user.id,
                        e.target.value as UserRow["role"]
                      )
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

      <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
        <p>
          Best-practice safeguards are enforced: no self demotion from Super Admin
          and no removal of the last Super Admin account.
        </p>
      </div>
    </div>
  );
}
