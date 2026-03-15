import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiPlus, FiLayers } from "react-icons/fi";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/fade-in";
import { FarmCard, FarmCardEmpty } from "@/components/farms/farm-card";
import { auth } from "@/auth";
import { getUserFarmsWithCount } from "@/lib/db/farms";

export const metadata: Metadata = {
  title: "My Farms — STRATA",
  description: "Manage your farms and view land analyses.",
};

export default async function FarmsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const farms = await getUserFarmsWithCount(session.user.id);

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] py-10 sm:py-12 bg-sand/30">
        <Container>
          <FadeIn>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-forest/10 px-3 py-1.5 rounded-full mb-3">
                  <FiLayers size={12} />
                  Farm Management
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  My Farms
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mt-1">
                  {farms.length > 0
                    ? `${farms.length} farm${farms.length !== 1 ? "s" : ""} registered`
                    : "No farms registered yet"}
                </p>
              </div>
              <Link
                href="/farms/create"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest/90 transition-colors"
              >
                <FiPlus size={14} />
                Add Farm
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {farms.length === 0 ? (
              <FarmCardEmpty />
            ) : (
              farms.map((farm, i) => (
                <FadeIn key={farm.id} delay={i * 0.05}>
                  <FarmCard farm={farm} />
                </FadeIn>
              ))
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
