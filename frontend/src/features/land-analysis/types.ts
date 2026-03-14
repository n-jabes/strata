export type SoilType = "clay" | "loam" | "sandy" | "volcanic";
export type RainfallLevel = "low" | "moderate" | "high";
export type ErosionRisk = "Low" | "Moderate" | "High";

export type FarmerInfo = {
  name: string;
  location: string;
  farmSize: number;
};

export type LandData = {
  slopeAngle: number;
  soilType: SoilType;
  rainfallLevel: RainfallLevel;
  altitude?: number;
};

export type AnalysisInput = FarmerInfo & LandData;

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
