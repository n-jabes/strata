import type { AnalysisInput, AnalysisResult, ErosionRisk, SoilType } from "../types";

const CROP_MAP: Record<SoilType, string[]> = {
  volcanic: ["Potatoes", "Maize", "Coffee", "Pyrethrum"],
  clay: ["Rice", "Sugarcane", "Cassava", "Taro"],
  loam: ["Maize", "Beans", "Sorghum", "Sweet Potatoes"],
  sandy: ["Groundnuts", "Millet", "Cowpeas", "Sesame"],
};

export function generateRecommendation(input: AnalysisInput): AnalysisResult {
  const { slopeAngle, soilType, rainfallLevel } = input;

  const terraceType =
    slopeAngle > 30
      ? "Bench terraces"
      : slopeAngle >= 15
      ? "Contour terraces"
      : "Broad-base terraces";

  const erosionRisk: ErosionRisk =
    slopeAngle > 30 ? "High" : slopeAngle >= 15 ? "Moderate" : "Low";

  const recommendedCrops = CROP_MAP[soilType];

  const irrigationSuggestion =
    rainfallLevel === "high"
      ? "Install drainage channels to prevent waterlogging and surface runoff"
      : rainfallLevel === "moderate"
      ? "Rainwater harvesting pits and retention walls are recommended"
      : "Drip irrigation system recommended for efficient water conservation";

  return { recommendedCrops, terraceType, erosionRisk, irrigationSuggestion };
}
