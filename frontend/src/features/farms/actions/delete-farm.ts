"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/auth/rbac";

export async function deleteFarmAction(farmId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    select: { id: true, userId: true },
  });
  if (!farm) {
    throw new Error("Farm not found");
  }

  const canDeleteAny = hasPermission(session.user.role, "farms.delete.any");
  const canDeleteOwn = hasPermission(session.user.role, "farms.delete.own");
  const isOwner = farm.userId === session.user.id;

  if (!(canDeleteAny || (canDeleteOwn && isOwner))) {
    throw new Error("Forbidden");
  }

  await prisma.farm.delete({ where: { id: farmId } });

  revalidatePath("/farms");
  revalidatePath("/dashboard");
  revalidatePath("/analysis-history");
}
