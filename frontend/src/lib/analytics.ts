type RecommendationLike = {
  recommendedCrops: string[];
};

type AnalysisLike = {
  slope: number;
  soilType: string;
  rainfall: string;
  recommendation?: RecommendationLike | null;
};

export type ChartDatum = {
  name: string;
  value: number;
};

const SOIL_COLORS = {
  volcanic: "#007E6E",
  clay: "#73AF6F",
  loam: "#D7C097",
  sandy: "#C9A66B",
} as const;

function titleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toSortedData(counts: Record<string, number>): ChartDatum[] {
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getSoilDistribution(analyses: AnalysisLike[]): ChartDatum[] {
  const counts = analyses.reduce<Record<string, number>>((acc, analysis) => {
    const soil = titleCase(analysis.soilType || "Unknown");
    acc[soil] = (acc[soil] ?? 0) + 1;
    return acc;
  }, {});

  return toSortedData(counts);
}

export function getRainfallDistribution(analyses: AnalysisLike[]): ChartDatum[] {
  const buckets: Record<string, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
  };

  analyses.forEach((analysis) => {
    const rainfall = (analysis.rainfall || "").trim().toLowerCase();

    if (rainfall.includes("low")) {
      buckets.Low += 1;
      return;
    }
    if (rainfall.includes("med")) {
      buckets.Medium += 1;
      return;
    }
    if (rainfall.includes("high")) {
      buckets.High += 1;
      return;
    }
  });

  return [
    { name: "Low", value: buckets.Low },
    { name: "Medium", value: buckets.Medium },
    { name: "High", value: buckets.High },
  ];
}

export function getSlopeCategories(analyses: AnalysisLike[]): ChartDatum[] {
  const categories = {
    Low: 0,
    Moderate: 0,
    Steep: 0,
  };

  analyses.forEach((analysis) => {
    if (analysis.slope < 15) {
      categories.Low += 1;
    } else if (analysis.slope < 30) {
      categories.Moderate += 1;
    } else {
      categories.Steep += 1;
    }
  });

  return [
    { name: "Low", value: categories.Low },
    { name: "Moderate", value: categories.Moderate },
    { name: "Steep", value: categories.Steep },
  ];
}

export function getCropFrequency(
  recommendations: Array<RecommendationLike | null | undefined>
): ChartDatum[] {
  const counts = recommendations.reduce<Record<string, number>>((acc, rec) => {
    if (!rec) return acc;
    rec.recommendedCrops.forEach((crop) => {
      const key = titleCase(crop || "Unknown");
      if (!key) return;
      acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, {});

  return toSortedData(counts);
}

export function getMostRecommendedCrop(
  recommendations: Array<RecommendationLike | null | undefined>
) {
  return getCropFrequency(recommendations)[0]?.name ?? null;
}

export function getInsights(analyses: AnalysisLike[]): string[] {
  if (!analyses.length) return [];

  const soilData = getSoilDistribution(analyses);
  const rainfallData = getRainfallDistribution(analyses);
  const slopeData = getSlopeCategories(analyses);
  const topCrop = getMostRecommendedCrop(analyses.map((a) => a.recommendation));

  const insights: string[] = [];
  const topSoil = soilData[0];
  const topRain = [...rainfallData].sort((a, b) => b.value - a.value)[0];
  const steepCount = slopeData.find((d) => d.name === "Steep")?.value ?? 0;

  if (topSoil && topSoil.value > 0) {
    insights.push(
      `${topSoil.name} is your most common soil type across recent analyses.`
    );
  }

  if (topCrop) {
    insights.push(`${topCrop} appears most often in your crop recommendations.`);
  }

  if (topRain && topRain.value > 0) {
    insights.push(`Most analyzed farms fall in ${topRain.name.toLowerCase()} rainfall zones.`);
  }

  if (steepCount > 0) {
    insights.push(
      `${steepCount} analyses are in steep terrain, where terracing is especially important.`
    );
  }

  const moderateAndSteep =
    (slopeData.find((d) => d.name === "Moderate")?.value ?? 0) + steepCount;
  if (moderateAndSteep >= Math.ceil(analyses.length * 0.6)) {
    insights.push("Most of your farms need erosion-aware planning due to slope conditions.");
  }

  return insights.slice(0, 5);
}

export function getSoilColor(soilName: string) {
  const key = soilName.trim().toLowerCase() as keyof typeof SOIL_COLORS;
  return SOIL_COLORS[key] ?? "#007E6E";
}
