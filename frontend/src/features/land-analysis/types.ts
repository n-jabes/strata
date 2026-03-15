export type SoilType = "clay" | "loam" | "sandy" | "volcanic";
export type RainfallLevel = "low" | "moderate" | "high";
export type ErosionRisk = "Low" | "Moderate" | "High";

/** The farm the analysis is linked to (selected in step 1). */
export type FarmSelection = {
  farmId: string;
};

/** Terrain + soil characteristics collected in step 2. */
export type LandData = {
  slopeAngle: number;
  soilType: SoilType;
  rainfallLevel: RainfallLevel;
};

export type AnalysisInput = FarmSelection & LandData;

export type AnalysisResult = {
  recommendedCrops: string[];
  terraceType: string;
  erosionRisk: ErosionRisk;
  irrigationSuggestion: string;
};

export type StoredAnalysis = {
  input: AnalysisInput;
  result: AnalysisResult;
  generatedAt: string;
};

export const ANALYSIS_STORAGE_KEY = "strata_analysis";
