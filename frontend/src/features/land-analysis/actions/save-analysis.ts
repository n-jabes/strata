"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/auth/rbac";
import { generateRecommendation } from "../logic/generate-recommendation";
import type { AnalysisInput } from "../types";

export type SaveAnalysisResult = {
  analysisId: string;
};

export async function saveAnalysis(
  input: AnalysisInput
): Promise<SaveAnalysisResult> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be signed in to save an analysis.");
  }
  const canUseAnyFarm = hasPermission(session.user.role, "farms.read.any");

  // Verify the farm belongs to the logged-in user unless admin can act across users.
  const farm = await prisma.farm.findFirst({
    where: canUseAnyFarm ? { id: input.farmId } : { id: input.farmId, userId: session.user.id },
    select: { id: true },
  });
  if (!farm) {
    throw new Error("Farm not found or you do not have permission to use it.");
  }

  const recommendation = generateRecommendation(input);

  const analysis = await prisma.landAnalysis.create({
    data: {
      slope: input.slopeAngle,
      soilType: input.soilType,
      rainfall: input.rainfallLevel,
      farmId: input.farmId,
      recommendation: {
        create: {
          terraceType: recommendation.terraceType,
          erosionRisk: recommendation.erosionRisk,
          irrigationSuggestion: recommendation.irrigationSuggestion,
          recommendedCrops: recommendation.recommendedCrops,
        },
      },
    },
    select: { id: true },
  });

  return { analysisId: analysis.id };
}
