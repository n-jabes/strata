import type { Metadata } from "next";
import { FiMap } from "react-icons/fi";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import { AnalysisForm } from "@/features/land-analysis/components/analysis-form";

export const metadata: Metadata = {
  title: "Analyze Land — STRATA",
  description:
    "Input your hillside terrain data to generate a sustainable farming plan.",
};

export default function AnalyzeLandPage() {
  return (
    <>
      <Navbar />
      {/* Page is viewport-locked — the form card scrolls internally */}
      <main className="min-h-[calc(100vh-4rem)] bg-sand/30 overflow-x-hidden">
        <Container size="sm" className="py-8 flex flex-col">
          <header className="shrink-0 mb-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-forest/10 px-3 py-1.5 rounded-full mb-3">
              <FiMap size={12} />
              Land Analysis
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Analyze Your Land
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-md">
              Fill in the details below and STRATA will generate a customized
              cultivation plan for your hillside.
            </p>
          </header>

          <AnalysisForm />
        </Container>
      </main>
    </>
  );
}
