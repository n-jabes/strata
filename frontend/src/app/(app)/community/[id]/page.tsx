"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiTrash2, FiMessageSquare, FiThumbsUp } from "react-icons/fi";
import { getPostById, deletePostRequest } from "@/features/community/posts/api";
import type { CommunityPost } from "@/features/community/posts/types";
import { COMMUNITY_POST_CATEGORIES } from "@/lib/community-posts";

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
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

export default function CommunityPostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const postId = params?.id;

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!postId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const loaded = await getPostById(postId);
        if (!mounted) return;
        setPost(loaded);
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Failed to load post";
        if (message === "NOT_FOUND") {
          setError("Post not found.");
        } else {
          setError(message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [postId]);

  const canDelete = useMemo(() => {
    if (!post) return false;
    const user = session?.user as Record<string, unknown> | null | undefined;
    const userId = typeof user?.id === "string" ? user.id : undefined;
    return !!userId && userId === post.userId;
  }, [post, session]);

  const isLoggedIn = !!session?.user;

  function requireLogin() {
    const callbackPath = postId ? `/community/${postId}` : "/community";
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  useEffect(() => {
    if (!showDeleteModal) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !deleting) {
        setShowDeleteModal(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showDeleteModal, deleting]);

  async function handleDelete() {
    if (!post) return;
    setDeleting(true);
    try {
      await deletePostRequest(post.id);
      router.push("/community");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      setError(message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
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
            {post ? (
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${typeBadgeClass(post.type)}`}>
                    {post.type}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                    {post.title}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {post.category} · By {post.user.name ?? "Farmer"} · {formatDate(post.createdAt)}
                  </p>
                </div>
                {canDelete && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      disabled={deleting}
                      onClick={() => setShowDeleteModal(true)}
                      className="justify-center"
                    >
                      <FiTrash2 size={16} />
                      {deleting ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </FadeIn>

        {loading ? (
          <FadeIn delay={0.12}>
            <Card className="p-8 text-center text-sm text-gray-500 rounded-2xl shadow-sm border border-gray-100">
              Loading post…
            </Card>
          </FadeIn>
        ) : error ? (
          <FadeIn delay={0.12}>
            <Card className="p-8 text-center text-sm text-gray-500 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-900 font-semibold">{error}</p>
              <Link
                href="/community"
                className="mt-4 inline-flex items-center gap-2 text-sm text-forest hover:underline transition-colors"
              >
                Back to feed
              </Link>
            </Card>
          </FadeIn>
        ) : post ? (
          <div className="space-y-6">
            <FadeIn delay={0.18}>
              <Card className="rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-4">
                  {post.type !== "TEXT" && post.mediaUrl ? (
                    <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      {post.type === "IMAGE" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.mediaUrl}
                          alt={post.title}
                          className="w-full max-h-[420px] object-cover"
                        />
                      ) : (
                        <video
                          src={post.mediaUrl}
                          controls
                          className="w-full max-h-[420px] object-cover bg-black/5"
                        />
                      )}
                    </div>
                  ) : null}

                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {post.description}
                  </p>

                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex px-2 py-1 rounded-full text-[11px] font-medium bg-leaf/15 text-forest border border-forest/10"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.22}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <FiThumbsUp size={16} />
                      Likes
                    </div>
                    <span className="text-sm text-gray-600">{post._count?.likes ?? 0}</span>
                  </div>
                  <Button
                    variant="ghost"
                    disabled={isLoggedIn}
                    onClick={requireLogin}
                    className="justify-center"
                  >
                    {isLoggedIn ? "Like (coming soon)" : "Login to Like"}
                  </Button>
                </Card>
                <Card className="rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <FiMessageSquare size={16} />
                      Comments
                    </div>
                    <span className="text-sm text-gray-600">{post._count?.comments ?? 0}</span>
                  </div>
                  <Button
                    variant="ghost"
                    disabled={isLoggedIn}
                    onClick={requireLogin}
                    className="justify-center"
                  >
                    {isLoggedIn ? "Comment (coming soon)" : "Login to Comment"}
                  </Button>
                </Card>
                <Card className="rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
                  <div className="text-sm font-semibold text-gray-900">Category</div>
                  <div className="text-sm text-gray-700">{post.category}</div>
                  <div className="text-xs text-gray-500">
                    {COMMUNITY_POST_CATEGORIES.includes(post.category) ? "Community-tagged content." : null}
                  </div>
                </Card>
              </div>
            </FadeIn>
          </div>
        ) : null}
      </Container>

      {showDeleteModal && post ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-post-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#0f0c09]/70 backdrop-blur-[2px]"
            onClick={() => !deleting && setShowDeleteModal(false)}
            aria-label="Close delete confirmation"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#d7c097]/35 bg-gradient-to-br from-[#1d1712] via-[#241b14] to-[#182922] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#73af6f]/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-10 -bottom-14 h-36 w-36 rounded-full bg-[#d7c097]/15 blur-3xl"
            />

            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-300/25 bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-200">
                Destructive Action
              </div>

              <h2
                id="delete-post-title"
                className="text-xl font-semibold tracking-tight text-[#f7f2df]"
              >
                Delete this post permanently?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#e7deaf]/80">
                This will remove{" "}
                <span className="font-medium text-[#f7f2df]">{post.title}</span>{" "}
                from the community feed and cannot be undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="!border !border-[#d7c097]/35 !bg-[#e7deaf]/10 !text-[#f8f3df] hover:!bg-[#e7deaf]/20"
                >
                  Cancel
                </Button>
                <Button
                  disabled={deleting}
                  onClick={handleDelete}
                  className="!bg-red-600 !text-white hover:!bg-red-500"
                >
                  <FiTrash2 size={16} />
                  {deleting ? "Deleting..." : "Delete Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

