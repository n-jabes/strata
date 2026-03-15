import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  FiLayers,
  FiMap,
  FiTrendingUp,
  FiDroplet,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";
import type { ErosionRisk } from "@/features/land-analysis/types";

export const metadata: Metadata = {
  title: "Analysis Result — STRATA",
};

const EROSION_STYLES: Record<ErosionRisk, string> = {
  Low: "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

export default async function AnalysisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  let analysis;
  try {
    analysis = await prisma.landAnalysis.findFirst({
      where: { id, farm: { farmer: { userId: session.user.id } } },
      include: {
        recommendation: true,
        farm: {
          include: { farmer: true },
        },
      },
    });
  } catch {
    // DB not reachable — show friendly error
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              Database unavailable
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Could not load the analysis. Please try again later.
            </p>
            <Link
              href="/analyze-land"
              className="mt-4 inline-flex items-center gap-2 text-sm text-forest hover:underline"
            >
              <FiArrowLeft size={14} /> Back to analysis form
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!analysis || !analysis.recommendation) notFound();

  const { farm, recommendation } = analysis;
  const { farmer } = farm;

  const date = analysis.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const erosionRisk = recommendation.erosionRisk as ErosionRisk;

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] py-12 bg-sand/30">
        <Container>
          {/* Header */}
          <FadeIn>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  Analysis generated {date}
                </p>
                <h1 className="text-3xl font-bold text-gray-900">
                  {farmer.name}&apos;s Analysis
                </h1>
                <p className="text-base text-gray-500 mt-1">
                  {farmer.location} · {farm.farmSize} ha
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href="/analyze-land">
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <FiRefreshCw size={14} />
                    New Analysis
                  </button>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Input summary strip */}
          <FadeIn delay={0.05}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Slope", value: `${analysis.slope}°` },
                { label: "Soil Type", value: analysis.soilType },
                { label: "Rainfall", value: analysis.rainfall },
                {
                  label: "Altitude",
                  value: farm.altitude ? `${farm.altitude} m` : "Not specified",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl p-4 border border-gray-100"
                >
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Result cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Crop Recommendations */}
            <FadeIn delay={0.1}>
              <Card hover className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-leaf/15 flex items-center justify-center">
                    <FiLayers size={18} className="text-leaf" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Crop Recommendations
                  </h2>
                </div>
                <ul className="space-y-2">
                  {recommendation.recommendedCrops.map((crop) => (
                    <li
                      key={crop}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-leaf shrink-0" />
                      {crop}
                    </li>
                  ))}
                </ul>
              </Card>
            </FadeIn>

            {/* Terrace Planning */}
            <FadeIn delay={0.15}>
              <Card hover className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                    <FiMap size={18} className="text-forest" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Terrace Planning
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Recommended terrace structure for your slope:
                </p>
                <div className="bg-forest/5 rounded-lg px-4 py-3">
                  <p className="text-base font-semibold text-forest">
                    {recommendation.terraceType}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Based on a {analysis.slope}° slope angle
                  </p>
                </div>
              </Card>
            </FadeIn>

            {/* Erosion Risk */}
            <FadeIn delay={0.2}>
              <Card hover className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <FiTrendingUp size={18} className="text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Soil Risk Assessment
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Erosion risk level for this terrain:
                </p>
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold",
                    EROSION_STYLES[erosionRisk]
                  )}
                >
                  {erosionRisk} Risk
                </span>
                <p className="text-xs text-gray-400 mt-3">
                  {erosionRisk === "High" &&
                    "Immediate soil conservation measures recommended."}
                  {erosionRisk === "Moderate" &&
                    "Preventive measures advised to protect topsoil."}
                  {erosionRisk === "Low" &&
                    "Terrain is stable. Standard maintenance applies."}
                </p>
              </Card>
            </FadeIn>

            {/* Irrigation */}
            <FadeIn delay={0.25}>
              <Card hover className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FiDroplet size={18} className="text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Irrigation Suggestion
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Water management approach:
                </p>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                  {recommendation.irrigationSuggestion}
                </p>
                <p className="text-xs text-gray-400 mt-2 capitalize">
                  Rainfall level: {analysis.rainfall}
                </p>
              </Card>
            </FadeIn>
          </div>

          {/* Footer link */}
          <FadeIn delay={0.3}>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/analysis-history"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-forest transition-colors"
              >
                View all analyses
              </Link>
              <span className="text-gray-300">·</span>
              <Link
                href="/analyze-land"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-forest transition-colors"
              >
                <FiArrowLeft size={14} />
                Back to Analysis
              </Link>
            </div>
          </FadeIn>
        </Container>
      </main>
      <Footer />
    </>
  );
}
