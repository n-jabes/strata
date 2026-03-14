import type { Metadata } from "next";
import Link from "next/link";
import { FiClock, FiMap, FiArrowRight, FiTrendingUp } from "react-icons/fi";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/fade-in";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import type { ErosionRisk } from "@/features/land-analysis/types";

export const metadata: Metadata = {
  title: "Analysis History — STRATA",
};

const EROSION_BADGE: Record<ErosionRisk, string> = {
  Low: "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

async function getAnalyses() {
  try {
    return await prisma.landAnalysis.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        farm: { include: { farmer: true } },
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
  const analyses = await getAnalyses();

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] py-12 bg-sand/30">
        <Container>
          {/* Header */}
          <FadeIn>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-forest/10 px-3 py-1.5 rounded-full mb-3">
                  <FiClock size={12} />
                  Analysis History
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  All Analyses
                </h1>
                <p className="text-base text-gray-500 mt-1">
                  {analyses.length > 0
                    ? `${analyses.length} analysis${analyses.length !== 1 ? "es" : ""} recorded`
                    : "No analyses recorded yet"}
                </p>
              </div>
              <Link
                href="/analyze-land"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest-dark transition-colors"
              >
                <FiMap size={14} />
                New Analysis
              </Link>
            </div>
          </FadeIn>

          {analyses.length === 0 ? (
            /* Empty state */
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest-dark transition-colors"
                >
                  Analyze Land <FiArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>
          ) : (
            /* Analysis cards grid */
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
                        {/* Top row */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {analysis.farm.farmer.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {analysis.farm.farmer.location}
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

                        {/* Data row */}
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

                        {/* Bottom row */}
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
      <Footer />
    </>
  );
}
