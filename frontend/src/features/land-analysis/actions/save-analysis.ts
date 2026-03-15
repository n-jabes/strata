"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

  const userId = session.user.id;
  const recommendation = generateRecommendation(input);

  const farmer = await prisma.farmer.create({
    data: {
      name: input.name,
      location: input.location,
      userId,
    },
  });

  const farm = await prisma.farm.create({
    data: {
      farmSize: input.farmSize,
      altitude: input.altitude ?? null,
      farmerId: farmer.id,
    },
  });

  const analysis = await prisma.landAnalysis.create({
    data: {
      slope: input.slopeAngle,
      soilType: input.soilType,
      rainfall: input.rainfallLevel,
      farmId: farm.id,
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
