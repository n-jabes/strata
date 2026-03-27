import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiClock, FiMap, FiArrowRight, FiTrendingUp } from "react-icons/fi";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/fade-in";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";
import type { ErosionRisk } from "@/features/land-analysis/types";
import { hasPermission, isAdminRole } from "@/lib/auth/rbac";

export const metadata: Metadata = {
  title: "Analysis History — STRATA",
};

const EROSION_BADGE: Record<ErosionRisk, string> = {
  Low: "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

async function getAnalyses(userId: string, role?: string) {
  const canReadAny = hasPermission(role, "analyses.read.any");
  try {
    return await prisma.landAnalysis.findMany({
      where: canReadAny ? undefined : { farm: { userId } },
      orderBy: { createdAt: "desc" },
      include: {
        farm: true,
        recommendation: {
          select: { terraceType: true, erosionRisk: true },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function AnalysisHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const isAdmin = isAdminRole(session.user.role);

  const analyses = await getAnalyses(session.user.id, session.user.role);

  return (
    <main className="min-h-0 py-8 sm:py-10 lg:py-12 bg-transparent">
      <Container>
        {/* Header */}
        <FadeIn>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-leaf/15 px-3 py-1.5 rounded-full mb-3">
                <FiClock size={12} />
                Analysis History
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {isAdmin ? "All Analyses" : "My Analyses"}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                {analyses.length > 0
                  ? `${analyses.length} analysis${analyses.length !== 1 ? "es" : ""} recorded`
                  : "No analyses recorded yet"}
              </p>
            </div>
            <Link
              href="/analyze-land"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest/90 transition-colors"
            >
              <FiMap size={14} />
              New Analysis
            </Link>
          </div>
        </FadeIn>

        {analyses.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <FiTrendingUp size={28} className="text-gray-300" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No analyses yet
              </h2>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                Start by analyzing your first piece of land. Results will
                appear here.
              </p>
              <Link
                href="/analyze-land"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest/90 transition-colors"
              >
                Analyze Land <FiArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {analyses.map((analysis, i) => {
              const risk = analysis.recommendation?.erosionRisk as
                | ErosionRisk
                | undefined;
              const date = analysis.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <FadeIn key={analysis.id} delay={i * 0.04}>
                  <Link href={`/analysis-result/${analysis.id}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 group h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {analysis.farm.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {analysis.farm.location}
                          </p>
                        </div>
                        {risk && (
                          <span
                            className={cn(
                              "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold shrink-0",
                              EROSION_BADGE[risk]
                            )}
                          >
                            {risk}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4 flex-1">
                        {[
                          { label: "Slope", value: `${analysis.slope}°` },
                          { label: "Soil", value: analysis.soilType },
                          { label: "Rain", value: analysis.rainfall },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="bg-gray-50 rounded-lg p-2"
                          >
                            <p className="text-[10px] text-gray-400 mb-0.5">
                              {label}
                            </p>
                            <p className="text-xs font-semibold text-gray-700 capitalize">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <p className="text-xs text-gray-400">{date}</p>
                        <span className="text-xs font-medium text-forest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          View results <FiArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
