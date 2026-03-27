import { prisma } from "@/lib/prisma";
import {
  hasPermission,
  isSuperAdminRole,
  normalizeRole,
  USER_ROLES,
  type UserRole,
} from "@/lib/auth/rbac";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

export async function listManagedUsers(): Promise<ManagedUser[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return users.map((u) => ({
    ...u,
    role: normalizeRole(u.role),
  }));
}

type UpdateUserRoleInput = {
  actorUserId: string;
  actorRole: string | null | undefined;
  targetUserId: string;
  nextRole: string;
};

export async function updateUserRole(input: UpdateUserRoleInput) {
  if (!hasPermission(input.actorRole, "users.roles.manage")) {
    throw new Error("FORBIDDEN");
  }

  if (!USER_ROLES.includes(input.nextRole as UserRole)) {
    throw new Error("INVALID_ROLE");
  }

  const normalizedNextRole = normalizeRole(input.nextRole);

  return prisma.$transaction(async (tx) => {
    const [actor, target] = await Promise.all([
      tx.user.findUnique({
        where: { id: input.actorUserId },
        select: { id: true, role: true },
      }),
      tx.user.findUnique({
        where: { id: input.targetUserId },
        select: { id: true, role: true },
      }),
    ]);

    if (!actor || !target) {
      throw new Error("USER_NOT_FOUND");
    }

    const actorRole = normalizeRole(actor.role);
    const targetRole = normalizeRole(target.role);

    if (!isSuperAdminRole(actorRole)) {
      throw new Error("FORBIDDEN");
    }

    // Super admin role is high impact:
    // 1) Prevent self-demotion to avoid accidental lockouts.
    if (actor.id === target.id && normalizedNextRole !== "SUPER_ADMIN") {
      throw new Error("SELF_DEMOTION_NOT_ALLOWED");
    }

    // 2) Always keep at least one super admin in the system.
    if (targetRole === "SUPER_ADMIN" && normalizedNextRole !== "SUPER_ADMIN") {
      const superAdminCount = await tx.user.count({
        where: { role: "SUPER_ADMIN" },
      });
      if (superAdminCount <= 1) {
        throw new Error("LAST_SUPER_ADMIN_PROTECTED");
      }
    }

    if (targetRole === normalizedNextRole) {
      return {
        changed: false,
        userId: target.id,
        role: targetRole,
      };
    }

    const updated = await tx.user.update({
      where: { id: target.id },
      data: { role: normalizedNextRole },
      select: { id: true, role: true },
    });

    return {
      changed: true,
      userId: updated.id,
      role: normalizeRole(updated.role),
    };
  });
}
