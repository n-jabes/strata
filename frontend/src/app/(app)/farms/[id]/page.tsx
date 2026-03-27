import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiMap,
  FiMapPin,
  FiLayers,
  FiCalendar,
} from "react-icons/fi";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { FarmAnalysisTable } from "@/components/farms/farm-analysis-table";
import { DeleteFarmButton } from "@/components/farms/delete-farm-button";
import { auth } from "@/auth";
import { getFarmById } from "@/lib/db/farms";
import { deleteFarmAction } from "@/features/farms/actions/delete-farm";
import { hasPermission, isAdminRole } from "@/lib/auth/rbac";

export const metadata: Metadata = {
  title: "Farm Details — STRATA",
};

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const canDeleteAny = hasPermission(session.user.role, "farms.delete.any");
  const canDeleteOwn = hasPermission(session.user.role, "farms.delete.own");
  const isAdmin = isAdminRole(session.user.role);

  const { id } = await params;
  const farm = await getFarmById(id, session.user.id, session.user.role);
  if (!farm) notFound();
  const canDeleteFarm = canDeleteAny || (canDeleteOwn && farm.userId === session.user.id);

  const createdDate = farm.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const infoItems = [
    {
      icon: FiMapPin,
      label: "Location",
      value: farm.location,
    },
    {
      icon: FiLayers,
      label: "Size",
      value: `${farm.size} ha`,
    },
    {
      icon: FiMap,
      label: "Altitude",
      value: farm.altitude ? `${farm.altitude} m` : "Not specified",
    },
    {
      icon: FiCalendar,
      label: "Registered",
      value: createdDate,
    },
  ];

  return (
    <main className="min-h-0 py-8 sm:py-10 lg:py-12 bg-transparent">
      <Container>
        {/* Header */}
        <FadeIn>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <Link
                href="/farms"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest transition-colors mb-4"
              >
                <FiArrowLeft size={14} />
                All Farms
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {farm.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                {farm.analyses.length} land{" "}
                {farm.analyses.length === 1 ? "analysis" : "analyses"}
              </p>
              {isAdmin && farm.user ? (
                <p className="text-xs text-gray-400 mt-1">
                  Owner: {farm.user.name ?? "Farmer"} ({farm.user.email})
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/analyze-land?farmId=${farm.id}`}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest/90 transition-colors"
              >
                <FiMap size={14} />
                Analyze New Land
              </Link>
              {canDeleteFarm ? (
                <DeleteFarmButton
                  deleteAction={async () => {
                    "use server";
                    await deleteFarmAction(farm.id);
                    redirect("/farms");
                  }}
                />
              ) : null}
            </div>
          </div>
        </FadeIn>

        {/* Farm Info Cards */}
        <FadeIn delay={0.05}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={13} className="text-forest shrink-0" />
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Analyses Table */}
        <FadeIn delay={0.1}>
          <Card className="overflow-hidden p-0">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Land Analyses
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  All analyses run on this farm
                </p>
              </div>
              {farm.analyses.length > 0 && (
                <Link
                  href={`/analyze-land?farmId=${farm.id}`}
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-forest hover:text-forest/80 transition-colors"
                >
                  <FiMap size={12} />
                  New Analysis
                </Link>
              )}
            </div>
            <FarmAnalysisTable analyses={farm.analyses} farmId={farm.id} />
          </Card>
        </FadeIn>
      </Container>
    </main>
  );
}
