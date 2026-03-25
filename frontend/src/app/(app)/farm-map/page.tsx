import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiMap } from "react-icons/fi";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/fade-in";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { FarmMap } from "@/components/map/FarmMap";
import type { FarmMapMarkerData } from "@/components/map/FarmMarker";

export const metadata: Metadata = {
  title: "Farm Map — STRATA",
  description: "Visualize your farms geographically",
};

export default async function FarmMapPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const farms = await prisma.farm.findMany({
    where: {
      userId: session.user.id,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      name: true,
      location: true,
      size: true,
      latitude: true,
      longitude: true,
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          slope: true,
          soilType: true,
          rainfall: true,
          recommendation: {
            select: { recommendedCrops: true },
          },
        },
      },
    },
  });

  const markers: FarmMapMarkerData[] = farms.map((farm) => {
    const latest = farm.analyses[0];
    return {
      id: farm.id,
      name: farm.name,
      location: farm.location,
      size: farm.size,
      latitude: farm.latitude!,
      longitude: farm.longitude!,
      latestAnalysis: latest
        ? {
            slope: latest.slope,
            soilType: latest.soilType,
            rainfall: latest.rainfall,
            recommendedCrops: latest.recommendation?.recommendedCrops ?? [],
          }
        : null,
    };
  });

  return (
    <main className="min-h-0 py-8 sm:py-10 lg:py-12 bg-transparent">
      <Container>
        <FadeIn>
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-forest/10 px-3 py-1.5 rounded-full mb-3">
              <FiMap size={12} />
              Farm Map
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Visualize your farms geographically
            </h1>
          </div>
        </FadeIn>

        {markers.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="bg-white/70 rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-leaf/15 flex items-center justify-center mx-auto mb-4">
                <FiMap size={26} className="text-forest/90" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No farms with location data yet.
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Add latitude and longitude in your farm profile to see it on the map.
              </p>
              <div className="mt-6">
                <Link
                  href="/farms/create"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 text-sm font-semibold bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors"
                >
                  Add Farm
                </Link>
              </div>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.15}>
            <FarmMap farms={markers} />
          </FadeIn>
        )}
      </Container>
    </main>
  );
}

