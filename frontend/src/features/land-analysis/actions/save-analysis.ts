"use server";

import { prisma } from "@/lib/prisma";
import { generateRecommendation } from "../logic/generate-recommendation";
import type { AnalysisInput } from "../types";

export type SaveAnalysisResult = {
  analysisId: string;
};

export async function saveAnalysis(
  input: AnalysisInput
): Promise<SaveAnalysisResult> {
  const recommendation = generateRecommendation(input);

  const farmer = await prisma.farmer.create({
    data: {
      name: input.name,
      location: input.location,
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
