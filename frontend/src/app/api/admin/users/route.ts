import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/rbac";
import { listManagedUsers } from "@/lib/auth/role-management";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "users.read.any")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await listManagedUsers();
  return NextResponse.json({ users });
}
