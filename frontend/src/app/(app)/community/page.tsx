"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FadeIn } from "@/components/animations/fade-in";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { COMMUNITY_POST_CATEGORIES } from "@/lib/community-posts";
import type { CommunityPostCategory } from "@/lib/community-posts";
import { FiArrowRight, FiMessageSquare, FiTrendingUp } from "react-icons/fi";
import type { CommunityPost } from "@/features/community/posts/types";
import { getPosts } from "@/features/community/posts/api";
import { usePostEngagement } from "@/features/community/posts/usePostEngagement";

const PAGE_SIZE = 20;

function isCategory(value: string | null): value is CommunityPostCategory {
  return !!value && (COMMUNITY_POST_CATEGORIES as readonly string[]).includes(value);
}

function truncate(value: string, maxLen: number) {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen).trim() + "…";
}

function typeBadgeClass(type: CommunityPost["type"]) {
  switch (type) {
    case "TEXT":
      return "bg-gray-100 text-gray-600";
    case "IMAGE":
      return "bg-leaf/15 text-leaf";
    case "VIDEO":
      return "bg-forest/10 text-forest";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function CommunityFeedInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [category, setCategory] = useState<CommunityPostCategory | "">("");
  const [hashtags, setHashtags] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"NEWEST" | "TOP">("NEWEST");

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextSkip, setNextSkip] = useState<number | null>(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [initialTake, setInitialTake] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const didHydrateFromUrlRef = useRef(false);

  useEffect(() => {
    const c = searchParams.get("category");
    if (isCategory(c)) setCategory(c);
    else setCategory("");

    setHashtags(searchParams.get("hashtags") ?? "");
    setSearch(searchParams.get("search") ?? "");
    const rawSort = searchParams.get("sort");
    setSort(rawSort === "TOP" ? "TOP" : "NEWEST");

    // Hydrate the initial page window from URL once.
    if (!didHydrateFromUrlRef.current) {
      const rawLoaded = Number(searchParams.get("loaded") ?? PAGE_SIZE);
      const sanitizedLoaded =
        Number.isFinite(rawLoaded) && rawLoaded >= PAGE_SIZE
          ? Math.min(rawLoaded, 200)
          : PAGE_SIZE;
      setInitialTake(sanitizedLoaded);
      didHydrateFromUrlRef.current = true;
    }
  }, [searchParams]);

  const categoryOptions = useMemo(
    () =>
      COMMUNITY_POST_CATEGORIES.map((c) => ({
        value: c,
        label: c
          .toLowerCase()
          .replace(/\b\w/g, (m) => m.toUpperCase()),
      })),
    []
  );

  function syncFeedUrl(loadedCount: number) {
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (hashtags) qs.set("hashtags", hashtags);
    if (search) qs.set("search", search);
    if (sort === "TOP") qs.set("sort", sort);
    if (loadedCount > PAGE_SIZE) qs.set("loaded", String(loadedCount));
    const query = qs.toString();
    router.replace(query ? `/community?${query}` : "/community", { scroll: false });
  }

  async function load(reset = false) {
    if (isFetchingRef.current) return;
    const skip = reset ? 0 : (nextSkip ?? 0);
    if (!reset && (!hasMore || nextSkip === null)) return;

    isFetchingRef.current = true;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const data = await getPosts({
        category: category || undefined,
        hashtags: hashtags || undefined,
        search: search || undefined,
        sort,
        take: reset ? initialTake : PAGE_SIZE,
        skip,
      });
      const incoming = data.posts ?? [];
      setTotalPosts(data.meta?.total ?? 0);
      let mergedLength = incoming.length;
      setPosts((prev) => {
        if (reset) return incoming;
        const merged = [...prev, ...incoming].filter(
          (post, idx, all) => all.findIndex((p) => p.id === post.id) === idx
        );
        mergedLength = merged.length;
        return merged;
      });
      if (reset) {
        syncFeedUrl(incoming.length);
      } else {
        syncFeedUrl(mergedLength);
      }
      setHasMore(Boolean(data.meta?.hasMore));
      setNextSkip(data.meta?.nextSkip ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load posts";
      setError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoadDone(true);
      isFetchingRef.current = false;
    }
  }

  useEffect(() => {
    setPosts([]);
    setNextSkip(0);
    setHasMore(false);
    setInitialLoadDone(false);
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, hashtags, search, sort, initialTake]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void load(false);
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, loadingMore, nextSkip]);

  return (
    <main className="min-h-0 py-8 sm:py-10 lg:py-12 bg-transparent">
      <Container>
        <FadeIn>
          <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-forest bg-forest/10 px-3 py-1.5 rounded-full mb-3">
                <FiTrendingUp size={12} />
                Community Learning
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Share & learn from your farms
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Post tips, guides, questions, and experiences. Others can respond
                and build on your knowledge.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={
                  session?.user
                    ? "/community/create"
                    : "/login?callbackUrl=/community/create"
                }
              >
                <Button className="justify-center">
                  {session?.user ? "Create Post" : "Login to Create"}
                  <FiArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <Card className="rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">{posts.length}</span>
                {" "}of{" "}
                <span className="font-semibold text-gray-700">{totalPosts}</span>
                {" "}posts
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select
                id="category"
                label="Category"
                placeholder="All categories"
                value={category || ""}
                onChange={(v) => setCategory(v as CommunityPostCategory)}
                options={categoryOptions}
              />
              <Input
                id="hashtags"
                label="Hashtags (comma-separated)"
                placeholder="e.g. soil,terraces"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
              />
              <Input
                id="search"
                label="Search"
                placeholder="Search title/description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                id="sort"
                label="Sort"
                value={sort}
                onChange={(v) => setSort(v === "TOP" ? "TOP" : "NEWEST")}
                options={[
                  { value: "NEWEST", label: "Newest" },
                  { value: "TOP", label: "Top Appreciated" },
                ]}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => {
                    const qs = new URLSearchParams();
                    if (category) qs.set("category", category);
                    if (hashtags) qs.set("hashtags", hashtags);
                    if (search) qs.set("search", search);
                    if (sort === "TOP") qs.set("sort", sort);
                    setInitialTake(PAGE_SIZE);
                    router.push(`/community?${qs.toString()}`);
                  }}
                  disabled={loading}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
            {(searchParams.toString() || "").length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm"
                  onClick={() => {
                    setCategory("");
                    setHashtags("");
                    setSearch("");
                    setSort("NEWEST");
                    setInitialTake(PAGE_SIZE);
                    router.push("/community");
                  }}
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>
            )}
          </Card>
        </FadeIn>

        {error && (
          <FadeIn delay={0.1}>
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
              {error}
            </div>
          </FadeIn>
        )}

        {loading && !initialLoadDone ? (
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <PostCardSkeleton key={`skeleton-initial-${idx}`} />
              ))}
            </div>
          </FadeIn>
        ) : posts.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="text-forest inline-flex items-center justify-center w-12 h-12 rounded-xl bg-forest/10 mb-4">
                <FiMessageSquare size={22} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">No posts found</h2>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your filters or create the first post in this category.
              </p>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.12}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostFeedCard key={post.id} post={post} />
              ))}
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              {loadingMore ? (
                <div className="grid w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <PostCardSkeleton key={`skeleton-more-${idx}`} />
                  ))}
                </div>
              ) : null}
              {hasMore && !loadingMore ? (
                <Button type="button" variant="secondary" onClick={() => void load(false)}>
                  Load more
                </Button>
              ) : null}
              {!hasMore && posts.length > 0 ? (
                <div className="text-xs text-gray-400">You have reached the end.</div>
              ) : null}
              <div ref={loadMoreRef} className="h-1 w-full" aria-hidden />
            </div>
          </FadeIn>
        )}
      </Container>
    </main>
  );
}

export default function CommunityFeedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CommunityFeedInner />
    </Suspense>
  );
}

function PostFeedCard({ post }: { post: CommunityPost }) {
  const engagement = usePostEngagement(post);

  return (
    <Link href={`/community/${post.id}`}>
      <Card
        hover
        className="rounded-2xl border border-gray-100 p-5 h-full"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${typeBadgeClass(post.type)}`}>
            {post.type}
          </span>
          <span className="text-xs text-gray-400">
            {post.category}
          </span>
        </div>

        {post.type !== "TEXT" && post.mediaUrl ? (
          <div className="mb-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            {post.type === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.mediaUrl}
                alt={post.title}
                className="w-full h-36 object-cover"
              />
            ) : (
              <video
                src={post.mediaUrl}
                className="w-full h-36 object-cover bg-black/5"
                muted
                controls={false}
              />
            )}
          </div>
        ) : null}

        <h3 className="text-base font-semibold text-gray-900 leading-snug">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          {truncate(post.description, 140)}
        </p>

        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.hashtags.slice(0, 5).map((t) => (
              <span
                key={t}
                className="inline-flex px-2 py-1 rounded-full text-[11px] font-medium bg-leaf/15 text-forest border border-forest/10"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            By{" "}
            <span className="font-medium text-gray-700">
              {post.user.name ?? "Farmer"}
            </span>
          </span>
          <span className="flex items-center gap-3">
            <span title="Appreciates">♥ {engagement.likes}</span>
            <span title="Comments">💬 {engagement.comments}</span>
          </span>
        </div>
      </Card>
    </Link>
  );
}

function PostCardSkeleton() {
  return (
    <Card className="rounded-2xl border border-gray-100 p-5 h-full animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-6 w-16 rounded-full bg-gray-200" />
        <div className="h-4 w-14 rounded bg-gray-100" />
      </div>
      <div className="mb-3 h-36 w-full rounded-xl bg-gray-100" />
      <div className="h-5 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-full rounded bg-gray-100" />
      <div className="mt-2 h-4 w-2/3 rounded bg-gray-100" />
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-14 rounded-full bg-gray-100" />
        <div className="h-5 w-16 rounded-full bg-gray-100" />
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-gray-100" />
        <div className="h-4 w-16 rounded bg-gray-100" />
      </div>
    </Card>
  );
}

