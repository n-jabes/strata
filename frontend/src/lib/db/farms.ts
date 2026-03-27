import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/auth/rbac";

export type FarmWithCount = {
  id: string;
  userId: string;
  name: string;
  location: string;
  size: number;
  altitude: number | null;
  createdAt: Date;
  _count: { analyses: number };
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export type FarmOption = {
  id: string;
  name: string;
  location: string;
  size: number;
  altitude: number | null;
};

export type FarmDetail = {
  id: string;
  userId: string;
  name: string;
  location: string;
  size: number;
  altitude: number | null;
  createdAt: Date;
  analyses: {
    id: string;
    slope: number;
    soilType: string;
    rainfall: string;
    createdAt: Date;
    recommendation: {
      terraceType: string;
      erosionRisk: string;
      recommendedCrops: string[];
    } | null;
  }[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

/** All farms for a user, with analysis count. */
export async function getUserFarmsWithCount(
  userId: string,
  role?: string
): Promise<FarmWithCount[]> {
  const canReadAny = hasPermission(role, "farms.read.any");
  return prisma.farm.findMany({
    where: canReadAny ? undefined : { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { analyses: true } },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

/** Lightweight farm list for dropdowns / form selects. */
export async function getUserFarmsAsOptions(
  userId: string,
  role?: string
): Promise<FarmOption[]> {
  const canReadAny = hasPermission(role, "farms.read.any");
  return prisma.farm.findMany({
    where: canReadAny ? undefined : { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, location: true, size: true, altitude: true },
  });
}

/** Single farm with all its analyses (ownership-checked). */
export async function getFarmById(
  farmId: string,
  userId: string,
  role?: string
): Promise<FarmDetail | null> {
  const canReadAny = hasPermission(role, "farms.read.any");
  return prisma.farm.findFirst({
    where: canReadAny ? { id: farmId } : { id: farmId, userId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      analyses: {
        orderBy: { createdAt: "desc" },
        include: {
          recommendation: {
            select: {
              terraceType: true,
              erosionRisk: true,
              recommendedCrops: true,
            },
          },
        },
      },
    },
  });
}
