import { prisma } from "@/lib/prisma";

export type FarmWithCount = {
  id: string;
  name: string;
  location: string;
  size: number;
  altitude: number | null;
  createdAt: Date;
  _count: { analyses: number };
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
};

/** All farms for a user, with analysis count. */
export async function getUserFarmsWithCount(
  userId: string
): Promise<FarmWithCount[]> {
  return prisma.farm.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { analyses: true } } },
  });
}

/** Lightweight farm list for dropdowns / form selects. */
export async function getUserFarmsAsOptions(
  userId: string
): Promise<FarmOption[]> {
  return prisma.farm.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, location: true, size: true, altitude: true },
  });
}

/** Single farm with all its analyses (ownership-checked). */
export async function getFarmById(
  farmId: string,
  userId: string
): Promise<FarmDetail | null> {
  return prisma.farm.findFirst({
    where: { id: farmId, userId },
    include: {
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
