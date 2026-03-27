import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { updateUserRole } from "@/lib/auth/role-management";

const updateRoleSchema = z.object({
  role: z.enum(["FARMER", "ADMIN", "SUPER_ADMIN"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = updateRoleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role payload." }, { status: 400 });
  }

  const { id: targetUserId } = await context.params;
  try {
    const result = await updateUserRole({
      actorUserId: session.user.id,
      actorRole: session.user.role,
      targetUserId,
      nextRole: parsed.data.role,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (error.message === "USER_NOT_FOUND") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (error.message === "INVALID_ROLE") {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      if (error.message === "SELF_DEMOTION_NOT_ALLOWED") {
        return NextResponse.json(
          { error: "You cannot remove your own SUPER_ADMIN role." },
          { status: 409 }
        );
      }
      if (error.message === "LAST_SUPER_ADMIN_PROTECTED") {
        return NextResponse.json(
          { error: "At least one SUPER_ADMIN must remain in the system." },
          { status: 409 }
        );
      }
    }
    return NextResponse.json({ error: "Failed to update role." }, { status: 500 });
  }
}
