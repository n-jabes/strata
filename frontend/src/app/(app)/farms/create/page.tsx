import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiLayers } from "react-icons/fi";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/fade-in";
import { FarmForm } from "@/components/farms/farm-form";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Create Farm — STRATA",
  description: "Register a new farm to start analyzing your land.",
};

export default async function CreateFarmPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <main className="min-h-0 py-8 sm:py-10 lg:py-12 bg-transparent">
      <Container size="sm">
        <FadeIn>
          <div className="mb-8">
            <Link
              href="/farms"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest transition-colors mb-5 mr-4"
            >
              <FiArrowLeft size={14} />
              Back to Farms
            </Link>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-forest/10 px-3 py-1.5 rounded-full mb-3">
              <FiLayers size={12} />
              New Farm
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create a Farm
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1 max-w-md">
              Register your farm to organize land analyses and track
              agricultural data over time.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <FarmForm />
        </FadeIn>
      </Container>
    </main>
  );
}
