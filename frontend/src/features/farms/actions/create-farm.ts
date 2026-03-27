"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/auth/rbac";

export type CreateFarmInput = {
  name: string;
  location: string;
  size: number;
  altitude?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

type CreateFarmResult =
  | { success: true; farmId: string }
  | { success: false; error: string };

export async function createFarm(
  input: CreateFarmInput
): Promise<CreateFarmResult> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!hasPermission(session.user.role, "farms.create")) {
    return { success: false, error: "You do not have permission to create farms." };
  }

  const name = input.name.trim();
  const location = input.location.trim();

  if (!name) return { success: false, error: "Farm name is required." };
  if (!location) return { success: false, error: "Location is required." };
  if (!input.size || isNaN(input.size) || input.size <= 0)
    return { success: false, error: "Farm size must be a positive number." };

  try {
    const farm = await prisma.farm.create({
      data: {
        name,
        location,
        size: input.size,
        altitude: input.altitude ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        userId: session.user.id,
      },
      select: { id: true },
    });
    return { success: true, farmId: farm.id };
  } catch {
    return { success: false, error: "Could not create farm. Please try again." };
  }
}
