export type LandParcel = {
  id: string;
  farmerId: string;
  name: string;
  areaHectares: number;
  slopePercent: number;
  region: string;
  soilType?: string;
  createdAt: string;
};

export type LandAnalysis = {
  id: string;
  parcelId: string;
  status: "pending" | "processing" | "complete" | "failed";
  result?: LandAnalysisResult;
  createdAt: string;
};

export type LandAnalysisResult = {
  suitabilityScore: number;
  erosionRisk: "low" | "medium" | "high";
  recommendedCrops: string[];
  terraceCount: number;
};
