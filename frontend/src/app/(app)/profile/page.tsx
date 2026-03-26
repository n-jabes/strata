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

  const initials =
    profile.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  return (
    <main className="min-h-0 bg-transparent py-8 sm:py-10 lg:py-12">
      <Container>
        <FadeIn>
          <div className="mb-6 overflow-hidden rounded-3xl border border-[#1a1612]/10 bg-gradient-to-br from-[#f6efd7] via-[#efe4c0] to-[#e8d8aa] p-6 sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#1a1612] text-xl font-bold text-[#e7deaf] shadow-[0_8px_18px_rgba(26,22,18,0.28)]">
                  {initials}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6d5b43]">
                    Profile Center
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight text-[#1f1912] sm:text-3xl">
                    {profile.name ?? "Your Profile"}
                  </h1>
                  <p className="mt-1 text-sm text-[#6d5b43]">{profile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl border border-[#1a1612]/10 bg-[#fbf7e9] px-3 py-2 text-center">
                  <p className="text-lg font-semibold text-[#1f1912]">
                    {profile.farms.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#6d5b43]">
                    Farms
                  </p>
                </div>
                <div className="rounded-xl border border-[#1a1612]/10 bg-[#fbf7e9] px-3 py-2 text-center">
                  <p className="text-lg font-semibold text-[#1f1912]">
                    {profile.posts.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#6d5b43]">
                    Posts
                  </p>
                </div>
                <div className="rounded-xl border border-[#1a1612]/10 bg-[#fbf7e9] px-3 py-2 text-center">
                  <p className="text-sm font-semibold text-[#1f1912] truncate">
                    {profile.experienceLevel ?? "Unset"}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#6d5b43]">
                    Level
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <FadeIn delay={0.06}>
            <Card className="xl:col-span-2 rounded-2xl border border-[#1a1612]/10 bg-[#fcf8ea] p-6 shadow-[0_20px_40px_-28px_rgba(26,22,18,0.35)]">
              <h2 className="mb-4 text-lg font-semibold text-[#1f1912]">
                Edit Profile
              </h2>
              <ProfileEditForm initialData={formInitialData} />
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="rounded-2xl border border-[#1a1612]/10 bg-[#fcf8ea] p-6 shadow-[0_20px_40px_-28px_rgba(26,22,18,0.35)]">
              <h2 className="mb-3 text-lg font-semibold text-[#1f1912]">
                Account
              </h2>
              <div className="space-y-2 text-sm text-[#5f5342]">
                <p>
                  <span className="font-medium text-[#2e271f]">Name:</span>{" "}
                  {profile.name}
                </p>
                <p>
                  <span className="font-medium text-[#2e271f]">Email:</span>{" "}
                  {profile.email}
                </p>
                <p>
                  <span className="font-medium text-[#2e271f]">Experience:</span>{" "}
                  {profile.experienceLevel ?? "Not set"}
                </p>
                <p>
                  <span className="font-medium text-[#2e271f]">Location:</span>{" "}
                  {profile.location || "Not set"}
                </p>
              </div>
            </Card>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
          <FadeIn delay={0.14}>
            <Card className="rounded-2xl border border-[#1a1612]/10 bg-[#fcf8ea] p-6 shadow-[0_20px_40px_-28px_rgba(26,22,18,0.35)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#1f1912]">My Farms</h3>
                <Link href="/farms" className="text-sm text-forest hover:underline">
                  View all
                </Link>
              </div>
              {profile.farms.length === 0 ? (
                <p className="text-sm text-[#6d5b43]">No farms added yet.</p>
              ) : (
                <ul className="space-y-3">
                  {profile.farms.slice(0, 5).map((farm) => (
                    <li
                      key={farm.id}
                      className="rounded-lg border border-[#1a1612]/10 bg-[#f9f3de] p-3"
                    >
                      <p className="text-sm font-medium text-[#1f1912]">{farm.name}</p>
                      <p className="text-xs text-[#6d5b43]">
                        {farm.location} • {farm.size} ha • {farm._count.analyses} analyses
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </FadeIn>

          <FadeIn delay={0.18}>
            <Card className="rounded-2xl border border-[#1a1612]/10 bg-[#fcf8ea] p-6 shadow-[0_20px_40px_-28px_rgba(26,22,18,0.35)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#1f1912]">My Posts</h3>
                <Link href="/community" className="text-sm text-forest hover:underline">
                  Community feed
                </Link>
              </div>
              {profile.posts.length === 0 ? (
                <p className="text-sm text-[#6d5b43]">No posts yet.</p>
              ) : (
                <ul className="space-y-3">
                  {profile.posts.slice(0, 5).map((post) => (
                    <li
                      key={post.id}
                      className="rounded-lg border border-[#1a1612]/10 bg-[#f9f3de] p-3"
                    >
                      <p className="text-sm font-medium text-[#1f1912]">{post.title}</p>
                      <p className="text-xs text-[#6d5b43]">
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

