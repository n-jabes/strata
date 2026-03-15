import { redirect } from "next/navigation";
import {
  FiMap,
  FiLayers,
  FiBarChart2,
  FiArrowRight,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { ErosionRisk } from "@/features/land-analysis/types";

const EROSION_BADGE: Record<ErosionRisk, string> = {
  Low: "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

async function getDashboardData(userId: string) {
  try {
    const [farmCount, analysisCount, soilGroups, recentAnalyses] =
      await Promise.all([
        prisma.farm.count({ where: { userId } }),
        prisma.landAnalysis.count({ where: { farm: { userId } } }),
        prisma.landAnalysis.groupBy({
          by: ["soilType"],
          where: { farm: { userId } },
          _count: { soilType: true },
          orderBy: { _count: { soilType: "desc" } },
          take: 1,
        }),
        prisma.landAnalysis.findMany({
          where: { farm: { userId } },
          take: 5,
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

    const topSoil = soilGroups[0]?.soilType ?? null;

    return { farmCount, analysisCount, topSoil, recentAnalyses };
  } catch {
    return {
      farmCount: 0,
      analysisCount: 0,
      topSoil: null,
      recentAnalyses: [],
    };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { farmCount, analysisCount, topSoil, recentAnalyses } =
    await getDashboardData(session.user.id);

  const firstName = session.user.name?.split(" ")[0] ?? "Farmer";

  const stats = [
    {
      label: "Registered Farms",
      value: formatNumber(farmCount),
      icon: FiLayers,
      color: "bg-forest/10 text-forest",
    },
    {
      label: "Land Analyses",
      value: formatNumber(analysisCount),
      icon: FiMap,
      color: "bg-leaf/10 text-leaf",
    },
    {
      label: "Top Soil Type",
      value: topSoil
        ? topSoil.charAt(0).toUpperCase() + topSoil.slice(1)
        : "—",
      icon: FiTrendingUp,
      color: "bg-soil/40 text-amber-700",
    },
  ];

  const quickActions = [
    {
      label: "My Farms",
      description: "View and manage your registered farms",
      href: "/farms",
      icon: FiLayers,
    },
    {
      label: "Analyze Land",
      description: "Start a new land analysis session",
      href: "/analyze-land",
      icon: FiMap,
    },
    {
      label: "Analysis History",
      description: "Browse all past analyses",
      href: "/analysis-history",
      icon: FiClock,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <FadeIn>
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Here&apos;s your STRATA agricultural overview.
          </p>
        </header>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.08}>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
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

      {/* Recent Analyses */}
      <FadeIn delay={0.25}>
        <Card className="mb-4 sm:mb-6 overflow-hidden p-0">
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

      {/* Quick Actions */}
      <FadeIn delay={0.3}>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map(({ label, description, href, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card hover className="group h-full">
                <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center mb-3 group-hover:bg-forest/20 transition-colors duration-200">
                  <Icon size={16} className="text-forest" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {label}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-forest opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Go <FiArrowRight size={12} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
