import Link from "next/link";
import { Card } from "@/components/ui/card";

type AuditRow = {
  id: string;
  fromRole: string;
  toRole: string;
  createdAt: string;
  actor: { name: string; email: string };
  target: { name: string; email: string };
};

type RoleChangeAuditSectionProps = {
  audits: AuditRow[];
};

function formatRole(role: string) {
  return role.replace("_", " ");
}

export function RoleChangeAuditSection({ audits }: RoleChangeAuditSectionProps) {
  return (
    <Card className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Role Change Audit Log</h2>
          <p className="mt-1 text-xs text-gray-500">
            Recent role transitions for compliance and incident tracking.
          </p>
        </div>
        <Link
          href="/api/admin/role-change-audits?format=csv&limit=500"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-forest/40 hover:bg-forest/5 hover:text-forest"
        >
          Export CSV
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Time
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Actor
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Target
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Transition
              </th>
            </tr>
          </thead>
          <tbody>
            {audits.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-5 text-sm text-gray-500">
                  No audit records yet.
                </td>
              </tr>
            ) : (
              audits.map((audit) => (
                <tr key={audit.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-3 py-3 text-xs text-gray-500">
                    {new Date(audit.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-sm font-medium text-gray-900">{audit.actor.name}</p>
                    <p className="text-xs text-gray-500">{audit.actor.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-sm font-medium text-gray-900">{audit.target.name}</p>
                    <p className="text-xs text-gray-500">{audit.target.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                      {formatRole(audit.fromRole)}
                    </span>
                    <span className="mx-2 text-xs text-gray-400">→</span>
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                      {formatRole(audit.toRole)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
