import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiLayers } from "react-icons/fi";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/fade-in";
import { auth } from "@/auth";
import { CommunityPostForm } from "@/features/community/posts/CommunityPostForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Post — Community Learning",
  description: "Share tips, guides, questions, and experiences with the STRATA community.",
};

export default async function CreateCommunityPostPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/community/create");
  }

  return (
    <main className="min-h-0 py-8 sm:py-10 lg:py-12 bg-transparent">
      <Container size="md">
        <FadeIn>
          <div className="mb-8">
            <Link
              href="/community"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest transition-colors mb-5 mr-4"
            >
              <FiArrowLeft size={14} />
              Back to Community
            </Link>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-forest/10 px-3 py-1.5 rounded-full mb-3">
              <FiLayers size={12} />
              New Community Post
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <CommunityPostForm />
        </FadeIn>
      </Container>
    </main>
  );
}

