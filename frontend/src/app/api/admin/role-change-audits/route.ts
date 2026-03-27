import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/rbac";
import { listRoleChangeAudits } from "@/lib/auth/role-management";

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "users.roles.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const limitParam = Number(searchParams.get("limit") ?? "100");
  const audits = await listRoleChangeAudits(Number.isFinite(limitParam) ? limitParam : 100);

  if (format === "csv") {
    const header = [
      "timestamp",
      "actor_name",
      "actor_email",
      "target_name",
      "target_email",
      "from_role",
      "to_role",
    ];

    const rows = audits.map((audit) => [
      audit.createdAt.toISOString(),
      audit.actor.name,
      audit.actor.email,
      audit.target.name,
      audit.target.email,
      audit.fromRole,
      audit.toRole,
    ]);

    const csv = [header, ...rows]
      .map((line) => line.map((cell) => escapeCsv(String(cell))).join(","))
      .join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="role-change-audits.csv"`,
      },
    });
  }

  return NextResponse.json({ audits });
}
