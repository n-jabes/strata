import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FiMap } from "react-icons/fi";
import { Container } from "@/components/ui/container";
import { AnalysisForm } from "@/features/land-analysis/components/analysis-form";
import { auth } from "@/auth";
import { getUserFarmsAsOptions } from "@/lib/db/farms";

export const metadata: Metadata = {
  title: "Analyze Land — STRATA",
  description:
    "Input your hillside terrain data to generate a sustainable farming plan.",
};

export default async function AnalyzeLandPage({
  searchParams,
}: {
  searchParams: Promise<{ farmId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { farmId } = await searchParams;
  const farms = await getUserFarmsAsOptions(session.user.id);

  return (
    <main className="min-h-0 bg-transparent overflow-x-hidden">
      <Container size="sm" className="py-8 sm:py-10 flex flex-col">
        <header className="shrink-0 mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-leaf/15 px-3 py-1.5 rounded-full mb-3">
            <FiMap size={12} />
            Land Analysis
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analyze Your Land
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 max-w-md">
            {farmId
              ? "Land data will be saved to your selected farm."
              : "Select a farm and fill in the terrain details to generate a cultivation plan."}
          </p>
        </header>

        <AnalysisForm farms={farms} initialFarmId={farmId} />
      </Container>
    </main>
  );
}
