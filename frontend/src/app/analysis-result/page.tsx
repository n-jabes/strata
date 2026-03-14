"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import type { StoredAnalysis, ErosionRisk } from "@/features/land-analysis/types";
import { ANALYSIS_STORAGE_KEY } from "@/features/land-analysis/types";
import { cn } from "@/lib/utils";

const EROSION_STYLES: Record<ErosionRisk, string> = {
  Low: "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

export default function AnalysisResultPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(ANALYSIS_STORAGE_KEY);
    if (!stored) {
      router.replace("/analyze-land");
      return;
    }
    setAnalysis(JSON.parse(stored) as StoredAnalysis);
  }, [router]);

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-forest border-t-transparent animate-spin" />
      </div>
    );
  }

  const { input, result, generatedAt } = analysis;
  const date = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
                  {input.name}&apos;s Analysis
                </h1>
                <p className="text-base text-gray-500 mt-1">
                  {input.location} · {input.farmSize} ha
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href="/analyze-land">
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <FiRefreshCw size={14} />
                    New Analysis
                  </button>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Analysis Summary strip */}
          <FadeIn delay={0.05}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Slope", value: `${input.slopeAngle}°` },
                { label: "Soil Type", value: input.soilType },
                { label: "Rainfall", value: input.rainfallLevel },
                {
                  label: "Altitude",
                  value: input.altitude ? `${input.altitude} m` : "Not specified",
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
                  {result.recommendedCrops.map((crop) => (
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
                    {result.terraceType}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Based on a {input.slopeAngle}° slope angle
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
                    EROSION_STYLES[result.erosionRisk]
                  )}
                >
                  {result.erosionRisk} Risk
                </span>
                <p className="text-xs text-gray-400 mt-3">
                  {result.erosionRisk === "High" &&
                    "Immediate soil conservation measures recommended."}
                  {result.erosionRisk === "Moderate" &&
                    "Preventive measures advised to protect topsoil."}
                  {result.erosionRisk === "Low" &&
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
                  {result.irrigationSuggestion}
                </p>
                <p className="text-xs text-gray-400 mt-2 capitalize">
                  Rainfall level: {input.rainfallLevel}
                </p>
              </Card>
            </FadeIn>
          </div>

          {/* Back link */}
          <FadeIn delay={0.3}>
            <div className="mt-8">
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
