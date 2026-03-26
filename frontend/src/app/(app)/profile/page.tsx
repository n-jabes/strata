import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getProfile } from "@/features/profile/service";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { ProfileEditForm } from "@/features/profile/ProfileEditForm";

export const metadata: Metadata = {
  title: "Profile — STRATA",
  description: "Manage your profile, farms, and community contributions.",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  const profile = await getProfile(session.user.id);
  if (!profile) redirect("/login");

  const formInitialData = {
    name: profile.name ?? "",
    location: profile.location ?? "",
    bio: profile.bio ?? "",
    profilePicture: profile.profilePicture ?? "",
    farmSize: profile.farmSize?.toString() ?? "",
    soilType: profile.soilType ?? "",
    experienceLevel: profile.experienceLevel ?? "",
  };

  return (
    <main className="min-h-0 py-8 sm:py-10 lg:py-12 bg-transparent">
      <Container>
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Manage your personal profile and view your farming/community activity.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <FadeIn delay={0.06}>
            <Card className="xl:col-span-2 rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
              <ProfileEditForm initialData={formInitialData} />
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Account</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Name:</span> {profile.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {profile.email}
                </p>
                <p>
                  <span className="font-medium">Experience:</span>{" "}
                  {profile.experienceLevel ?? "Not set"}
                </p>
              </div>
            </Card>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
          <FadeIn delay={0.14}>
            <Card className="rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">My Farms</h3>
                <Link href="/farms" className="text-sm text-forest hover:underline">
                  View all
                </Link>
              </div>
              {profile.farms.length === 0 ? (
                <p className="text-sm text-gray-500">No farms added yet.</p>
              ) : (
                <ul className="space-y-3">
                  {profile.farms.slice(0, 5).map((farm) => (
                    <li key={farm.id} className="rounded-lg border border-gray-100 p-3">
                      <p className="text-sm font-medium text-gray-900">{farm.name}</p>
                      <p className="text-xs text-gray-500">
                        {farm.location} • {farm.size} ha • {farm._count.analyses} analyses
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </FadeIn>

          <FadeIn delay={0.18}>
            <Card className="rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">My Posts</h3>
                <Link href="/community" className="text-sm text-forest hover:underline">
                  Community feed
                </Link>
              </div>
              {profile.posts.length === 0 ? (
                <p className="text-sm text-gray-500">No posts yet.</p>
              ) : (
                <ul className="space-y-3">
                  {profile.posts.slice(0, 5).map((post) => (
                    <li key={post.id} className="rounded-lg border border-gray-100 p-3">
                      <p className="text-sm font-medium text-gray-900">{post.title}</p>
                      <p className="text-xs text-gray-500">
                        {post.type} • {post.category} • ♥ {post._count.likes} • 💬 {post._count.comments}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </FadeIn>
        </div>
      </Container>
    </main>
  );
}

