import { redirect } from "next/navigation";
import {
  FiArrowRight,
  FiBarChart2,
  FiCloudRain,
  FiLayers,
  FiMap,
  FiPieChart,
  FiTarget,
} from "react-icons/fi";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { ErosionRisk } from "@/features/land-analysis/types";
import {
  getCropFrequency,
  getInsights,
  getMostRecommendedCrop,
  getRainfallDistribution,
  getSlopeCategories,
  getSoilDistribution,
} from "@/lib/analytics";
import { SoilChart } from "@/components/charts/SoilChart";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { SlopeChart } from "@/components/charts/SlopeChart";
import { CropChart } from "@/components/charts/CropChart";

const EROSION_BADGE: Record<ErosionRisk, string> = {
  Low: "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

async function getDashboardData(userId: string) {
  try {
    const [farmCount, analysisCount, analyses, recentAnalyses] =
      await Promise.all([
        prisma.farm.count({ where: { userId } }),
        prisma.landAnalysis.count({ where: { farm: { userId } } }),
        prisma.landAnalysis.findMany({
          where: { farm: { userId } },
          select: {
            slope: true,
            soilType: true,
            rainfall: true,
            recommendation: {
              select: {
                recommendedCrops: true,
              },
            },
          },
        }),
        prisma.landAnalysis.findMany({
          where: { farm: { userId } },
          take: 6,
          orderBy: { createdAt: "desc" },
          include: {
            farm: true,
            recommendation: {
              select: {
                terraceType: true,
                erosionRisk: true,
                recommendedCrops: true,
              },
            },
          },
        }),
      ]);

    const soilDistribution = getSoilDistribution(analyses);
    const rainfallDistribution = getRainfallDistribution(analyses);
    const slopeDistribution = getSlopeCategories(analyses);
    const cropFrequency = getCropFrequency(analyses.map((a) => a.recommendation));
    const topSoil = soilDistribution[0]?.name ?? null;
    const topCrop = getMostRecommendedCrop(analyses.map((a) => a.recommendation));
    const insights = getInsights(analyses).slice(0, 5);

    return {
      farmCount,
      analysisCount,
      topSoil,
      topCrop,
      soilDistribution,
      rainfallDistribution,
      slopeDistribution,
      cropFrequency,
      insights,
      recentAnalyses,
    };
  } catch {
    return {
      farmCount: 0,
      analysisCount: 0,
      topSoil: null,
      topCrop: null,
      soilDistribution: [],
      rainfallDistribution: [],
      slopeDistribution: [],
      cropFrequency: [],
      insights: [],
      recentAnalyses: [],
    };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const {
    farmCount,
    analysisCount,
    topSoil,
    topCrop,
    soilDistribution,
    rainfallDistribution,
    slopeDistribution,
    cropFrequency,
    insights,
    recentAnalyses,
  } = await getDashboardData(session.user.id);

  const firstName = session.user.name?.split(" ")[0] ?? "Farmer";
  const hasAnalytics = analysisCount > 0;

  const stats = [
    {
      label: "Total Farms",
      value: formatNumber(farmCount),
      icon: FiLayers,
      color: "bg-forest/10 text-forest",
    },
    {
      label: "Total Analyses",
      value: formatNumber(analysisCount),
      icon: FiBarChart2,
      color: "bg-leaf/10 text-leaf",
    },
    {
      label: "Most Common Soil Type",
      value: topSoil ?? "—",
      icon: FiPieChart,
      color: "bg-soil/50 text-amber-700",
    },
    {
      label: "Most Recommended Crop",
      value: topCrop ?? "—",
      icon: FiTarget,
      color: "bg-forest/15 text-forest-dark",
    },
  ];

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Track patterns in your land data and recommendations.
          </p>
        </header>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.06}>
            <Card
              className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 truncate">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon size={18} />
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      {!hasAnalytics ? (
        <FadeIn delay={0.2}>
          <Card className="rounded-xl shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-forest/10 text-forest mx-auto flex items-center justify-center mb-4">
              <FiMap size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">No data available yet</h2>
            <p className="text-sm text-gray-500 mt-2">
              Start by analyzing your land to unlock dashboard analytics and insights.
            </p>
            <Link
              href="/analyze-land"
              className="inline-flex mt-5 items-center gap-2 px-4 py-2 rounded-lg bg-forest text-white hover:bg-forest/90 transition-colors text-sm font-semibold"
            >
              Analyze Land <FiArrowRight size={14} />
            </Link>
          </Card>
        </FadeIn>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
            <FadeIn delay={0.22}>
              <SoilChart data={soilDistribution} />
            </FadeIn>
            <FadeIn delay={0.25}>
              <RainfallChart data={rainfallDistribution} />
            </FadeIn>
            <FadeIn delay={0.28}>
              <SlopeChart data={slopeDistribution} />
            </FadeIn>
            <FadeIn delay={0.31}>
              <CropChart data={cropFrequency} />
            </FadeIn>
          </div>

          <FadeIn delay={0.34}>
            <Card className="rounded-xl shadow-sm mb-6 sm:mb-8">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-forest/10 text-forest flex items-center justify-center shrink-0">
                  <FiCloudRain size={16} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Insights</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Highlights automatically generated from your data
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5">
                {insights.slice(0, 5).map((insight) => (
                  <li
                    key={insight}
                    className="text-sm text-gray-700 leading-relaxed flex gap-2"
                  >
                    <span className="text-leaf mt-[2px]">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </FadeIn>
        </>
      )}

      <FadeIn delay={0.36}>
        <Card className="mb-4 sm:mb-6 overflow-hidden p-0 rounded-xl shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Recent Analyses
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Your latest land analysis sessions
              </p>
            </div>
            <Link
              href="/analysis-history"
              className="text-xs font-medium text-forest hover:text-forest/80 transition-colors flex items-center gap-1"
            >
              View all <FiArrowRight size={12} />
            </Link>
          </div>

          {recentAnalyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-sm text-gray-400 gap-2">
              <FiMap size={24} className="text-gray-300" />
              No analyses yet. Create a farm and start analyzing.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Farm
                    </th>
                    <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Location
                    </th>
                    <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Slope
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Risk
                    </th>
                    <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {recentAnalyses.map((a) => {
                    const risk = a.recommendation?.erosionRisk as
                      | ErosionRisk
                      | undefined;
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">
                          {a.farm.name}
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3 text-gray-500">
                          {a.farm.location}
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 text-gray-500">
                          {a.slope}°
                        </td>
                        <td className="px-4 py-3">
                          {risk && (
                            <span
                              className={cn(
                                "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold",
                                EROSION_BADGE[risk]
                              )}
                            >
                              {risk}
                            </span>
                          )}
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3 text-gray-400 text-xs">
                          {a.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/analysis-result/${a.id}`}
                            className="text-xs font-medium text-forest hover:text-forest/80 transition-colors"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
