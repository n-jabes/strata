"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiTrash2, FiMessageSquare, FiThumbsUp, FiEdit2 } from "react-icons/fi";
import {
  getPostById,
  deletePostRequest,
  toggleAppreciateRequest,
  getPostCommentsRequest,
  createPostCommentRequest,
  editPostCommentRequest,
  deletePostCommentRequest,
} from "@/features/community/posts/api";
import type { CommunityPost, CommunityPostComment } from "@/features/community/posts/types";
import { COMMUNITY_POST_CATEGORIES } from "@/lib/community-posts";

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [appreciating, setAppreciating] = useState(false);
  const [appreciated, setAppreciated] = useState(false);
  const [appreciateCount, setAppreciateCount] = useState(0);
  const [comments, setComments] = useState<CommunityPostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentTotalCount, setCommentTotalCount] = useState(0);
  const [commentDraft, setCommentDraft] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState("");
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);

  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [postingReply, setPostingReply] = useState(false);

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
        setAppreciated(!!loaded.viewerHasAppreciated);
        setAppreciateCount(loaded._count?.likes ?? 0);
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

  useEffect(() => {
    if (!post?.id) return;
    let mounted = true;
    (async () => {
      setLoadingComments(true);
      try {
        const result = await getPostCommentsRequest(post.id);
        if (!mounted) return;
        setComments(result.comments);
        setCommentTotalCount(result.total);
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setLoadingComments(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [post?.id]);

  const canDelete = useMemo(() => {
    if (!post) return false;
    const user = session?.user as Record<string, unknown> | null | undefined;
    const userId = typeof user?.id === "string" ? user.id : undefined;
    return !!userId && userId === post.userId;
  }, [post, session]);

  const isLoggedIn = !!session?.user;
  const viewerUserId: string | undefined =
    typeof (session?.user as Record<string, unknown> | null | undefined)?.id ===
    "string"
      ? ((session?.user as Record<string, unknown>).id as string)
      : undefined;
  const viewerEmail: string | null =
    typeof (session?.user as Record<string, unknown> | null | undefined)?.email ===
    "string"
      ? ((session?.user as Record<string, unknown>).email as string)
      : null;

  function isCommentOwned(comment: CommunityPostComment) {
    if (viewerUserId) return comment.userId === viewerUserId;
    if (viewerEmail && comment.user.email) return comment.user.email === viewerEmail;
    return false;
  }

  function requireLogin() {
    const callbackPath = postId ? `/community/${postId}` : "/community";
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  function findCommentInTree(
    nodes: CommunityPostComment[],
    commentId: string
  ): CommunityPostComment | undefined {
    for (const node of nodes) {
      if (node.id === commentId) return node;
      if (node.replies?.length) {
        const found = findCommentInTree(node.replies, commentId);
        if (found) return found;
      }
    }
    return undefined;
  }

  function updateCommentInTree(
    nodes: CommunityPostComment[],
    commentId: string,
    updater: (comment: CommunityPostComment) => CommunityPostComment
  ): CommunityPostComment[] {
    return nodes.map((node) => {
      if (node.id === commentId) return updater(node);
      if (!node.replies?.length) return node;
      return {
        ...node,
        replies: updateCommentInTree(node.replies, commentId, updater),
      };
    });
  }

  function removeCommentFromTree(
    nodes: CommunityPostComment[],
    commentId: string
  ): CommunityPostComment[] {
    return nodes
      .filter((node) => node.id !== commentId)
      .map((node) => {
        if (!node.replies?.length) return node;
        return {
          ...node,
          replies: removeCommentFromTree(node.replies, commentId),
        };
      });
  }

  function insertReplyInTree(
    nodes: CommunityPostComment[],
    parentId: string,
    reply: CommunityPostComment
  ): CommunityPostComment[] {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          replies: [reply, ...(node.replies ?? [])],
        };
      }

      if (!node.replies?.length) return node;
      return {
        ...node,
        replies: insertReplyInTree(node.replies, parentId, reply),
      };
    });
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

  useEffect(() => {
    if (!showDeleteCommentModal) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !deletingComment) {
        setShowDeleteCommentModal(false);
        setDeleteCommentId(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showDeleteCommentModal, deletingComment]);

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

  async function handleAppreciate() {
    if (!post) return;
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    if (appreciating) return;
    const prevAppreciated = appreciated;
    const prevCount = appreciateCount;

    const nextAppreciated = !prevAppreciated;
    const nextCount = Math.max(0, prevCount + (nextAppreciated ? 1 : -1));

    setAppreciated(nextAppreciated);
    setAppreciateCount(nextCount);
    setAppreciating(true);
    try {
      const result = await toggleAppreciateRequest(post.id);
      setAppreciated(result.appreciated);
      setAppreciateCount(result.appreciates);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update appreciation";
      setError(message);
      setAppreciated(prevAppreciated);
      setAppreciateCount(prevCount);
    } finally {
      setAppreciating(false);
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!post) return;
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    const content = commentDraft.trim();
    if (!content || postingComment) return;
    if (!viewerUserId) return;

    const viewerName: string =
      typeof (session?.user as Record<string, unknown> | null | undefined)?.name ===
      "string"
        ? ((session?.user as Record<string, unknown>).name as string)
        : "Farmer";
    const viewerEmail: string | null =
      typeof (session?.user as Record<string, unknown> | null | undefined)?.email ===
      "string"
        ? ((session?.user as Record<string, unknown>).email as string)
        : null;

    const tempId = `temp-${post.id}-${Date.now()}`;
    const now = new Date();
    const optimisticComment: CommunityPostComment = {
      id: tempId,
      content,
      createdAt: now,
      updatedAt: now,
      userId: viewerUserId,
      parentCommentId: null,
      user: {
        id: viewerUserId,
        name: viewerName,
        email: viewerEmail,
      },
    };

    setPostingComment(true);
    setCommentTotalCount((prev) => prev + 1);
    setComments((prev) => [optimisticComment, ...prev]);
    setCommentDraft("");

    try {
      const result = await createPostCommentRequest(post.id, content);
      setComments((prev) =>
        updateCommentInTree(prev, tempId, () => result.comment)
      );
      setCommentTotalCount(result.comments);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not post comment";
      setError(message);
      setComments((prev) => removeCommentFromTree(prev, tempId));
      setCommentTotalCount((prev) => Math.max(0, prev - 1));
      setCommentDraft(content);
    } finally {
      setPostingComment(false);
    }
  }

  async function handleReplySubmit(
    parentCommentId: string,
    e: React.FormEvent
  ) {
    e.preventDefault();
    if (!post) return;
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    const content = replyDraft.trim();
    if (!content || postingReply) return;
    if (!viewerUserId) return;

    const viewerName: string =
      typeof (session?.user as Record<string, unknown> | null | undefined)?.name ===
      "string"
        ? ((session?.user as Record<string, unknown>).name as string)
        : "Farmer";
    const viewerEmail: string | null =
      typeof (session?.user as Record<string, unknown> | null | undefined)?.email ===
      "string"
        ? ((session?.user as Record<string, unknown>).email as string)
        : null;

    const tempId = `temp-reply-${post.id}-${parentCommentId}-${Date.now()}`;
    const now = new Date();
    const optimisticReply: CommunityPostComment = {
      id: tempId,
      content,
      createdAt: now,
      updatedAt: now,
      userId: viewerUserId,
      parentCommentId,
      user: {
        id: viewerUserId,
        name: viewerName,
        email: viewerEmail,
      },
    };

    setPostingReply(true);
    setCommentTotalCount((prev) => prev + 1);
    setReplyDraft("");
    setReplyingToCommentId(null);
    setComments((prev) => insertReplyInTree(prev, parentCommentId, optimisticReply));

    try {
      const result = await createPostCommentRequest(
        post.id,
        content,
        parentCommentId
      );
      setComments((prev) =>
        updateCommentInTree(prev, tempId, () => result.comment)
      );
      setCommentTotalCount(result.comments);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not post reply";
      setError(message);
      setComments((prev) => removeCommentFromTree(prev, tempId));
      setCommentTotalCount((prev) => Math.max(0, prev - 1));
      setReplyDraft(content);
      setReplyingToCommentId(parentCommentId);
    } finally {
      setPostingReply(false);
    }
  }

  async function handleStartEdit(commentId: string) {
    const existing = findCommentInTree(comments, commentId);
    if (!existing) return;
    if (!isCommentOwned(existing)) return;
    setEditingCommentId(commentId);
    setEditingCommentDraft(existing.content);
    setReplyingToCommentId(null);
    setReplyDraft("");
  }

  async function handleCancelEdit() {
    setEditingCommentId(null);
    setEditingCommentDraft("");
  }

  async function handleSaveEditedComment(commentId: string) {
    if (!post) return;
    if (!editingCommentDraft.trim()) return;

    const previous = findCommentInTree(comments, commentId);
    if (!previous) return;

    const nextContent = editingCommentDraft.trim();

    setComments((prev) =>
      updateCommentInTree(prev, commentId, (c) => ({ ...c, content: nextContent }))
    );
    setEditingCommentId(null);

    try {
      const result = await editPostCommentRequest(post.id, commentId, nextContent);
      setComments((prev) =>
        updateCommentInTree(prev, commentId, () => result.comment)
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update comment";
      setError(message);
      setComments((prev) =>
        updateCommentInTree(prev, commentId, (c) => ({ ...c, content: previous.content }))
      );
      setEditingCommentId(commentId);
      setEditingCommentDraft(previous.content);
    }
  }

  async function handleRequestDeleteComment(commentId: string) {
    const existing = findCommentInTree(comments, commentId);
    if (!existing) return;
    if (!isCommentOwned(existing)) return;
    setDeleteCommentId(commentId);
    setShowDeleteCommentModal(true);
  }

  async function handleCancelDeleteCommentModal() {
    setShowDeleteCommentModal(false);
    setDeleteCommentId(null);
  }

  async function handleConfirmDeleteComment(commentId: string) {
    if (!post) return;

    const target = findCommentInTree(comments, commentId);
    if (!target) return;
    if (!isCommentOwned(target)) return;

    setDeletingComment(true);
    setShowDeleteCommentModal(false);
    setDeleteCommentId(null);

    const toRestore = target;
    setComments((prev) => removeCommentFromTree(prev, commentId));
    setCommentTotalCount((prev) => Math.max(0, prev - 1));

    try {
      const result = await deletePostCommentRequest(post.id, commentId);
      setCommentTotalCount(result.comments);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not delete comment";
      setError(message);
      setComments((prev) =>
        toRestore.parentCommentId
          ? insertReplyInTree(prev, toRestore.parentCommentId, toRestore)
          : [toRestore, ...prev]
      );
      setCommentTotalCount((prev) => prev + 1);
    } finally {
      setDeletingComment(false);
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
                      Appreciates
                    </div>
                    <span className="text-sm text-gray-600">{appreciateCount}</span>
                  </div>
                  <Button
                    variant="ghost"
                    disabled={appreciating}
                    onClick={handleAppreciate}
                    className="justify-center"
                  >
                    {isLoggedIn
                      ? appreciating
                        ? "Updating..."
                        : appreciated
                        ? "Appreciated"
                        : "Appreciate"
                      : "Login to Appreciate"}
                  </Button>
                </Card>
                <Card className="rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <FiMessageSquare size={16} />
                      Comments
                    </div>
                      <span className="text-sm text-gray-600">{commentTotalCount}</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const section = document.getElementById("post-comments");
                      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="justify-center"
                  >
                    {isLoggedIn ? "Write a comment" : "Login to Comment"}
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

            <FadeIn delay={0.26}>
              <Card
                className="rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[85vh] max-h-[900px] overflow-hidden"
              >
                <div
                  id="post-comments"
                  className="mb-4 flex items-center justify-between"
                >
                  <h3 className="text-base font-semibold text-gray-900">
                    Comments ({commentTotalCount})
                  </h3>
                  {!isLoggedIn ? (
                    <Button variant="ghost" onClick={requireLogin}>
                      Login to Comment
                    </Button>
                  ) : null}
                </div>

                {isLoggedIn ? (
                  <form onSubmit={handleCommentSubmit} className="mb-5 space-y-3">
                    <textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      className="w-full min-h-[96px] rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:shadow-[inset_0_0_0_1px_#007E6E]"
                      placeholder="Share an encouraging thought, suggestion, or question..."
                      maxLength={600}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {commentDraft.trim().length}/600
                      </span>
                      <Button
                        type="submit"
                        disabled={postingComment || commentDraft.trim().length === 0}
                      >
                        {postingComment ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </form>
                ) : null}

                <div className="flex-1 overflow-y-auto main-scroll pr-2">
                  {loadingComments ? (
                    <p className="text-sm text-gray-500">Loading comments...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No comments yet. Be the first to encourage this farmer.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {comments.map((comment) => (
                        <li
                          key={comment.id}
                          className="rounded-xl border border-gray-100 bg-gray-50/60 p-3"
                        >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-gray-900">
                            {comment.user.name ?? "Farmer"}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">
                              {formatDateTime(comment.createdAt)}
                            </p>
                            {isCommentOwned(comment) ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => void handleStartEdit(comment.id)}
                                  className="h-8 w-8 !px-0 !py-0 p-0 justify-center rounded-lg border border-forest/20 bg-leaf/10 text-forest hover:bg-leaf/20"
                                >
                                  <FiEdit2 size={16} />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() =>
                                    void handleRequestDeleteComment(comment.id)
                                  }
                                  className="h-8 w-8 !px-0 !py-0 p-0 justify-center rounded-lg border border-forest/20 bg-leaf/10 text-forest hover:bg-leaf/20"
                                  disabled={deletingComment}
                                >
                                  <FiTrash2 size={16} />
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {editingCommentId === comment.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void handleSaveEditedComment(comment.id);
                            }}
                            className="space-y-2"
                          >
                            <textarea
                              value={editingCommentDraft}
                              onChange={(e) =>
                                setEditingCommentDraft(e.target.value)
                              }
                              className="w-full min-h-[90px] rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:shadow-[inset_0_0_0_1px_#007E6E]"
                              maxLength={600}
                            />
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => void handleCancelEdit()}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={editingCommentDraft.trim().length === 0}
                              >
                                Save
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                            {comment.content}
                          </p>
                        )}

                        {comment.parentCommentId == null && editingCommentId !== comment.id ? (
                          <div className="mt-3 flex items-center justify-between gap-2">
                            {isLoggedIn ? (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  setReplyDraft("");
                                  setReplyingToCommentId(comment.id);
                                }}
                                className="!h-auto px-2 py-1 text-sm text-forest hover:bg-forest/10"
                              >
                                Reply
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                onClick={requireLogin}
                                className="!h-auto px-2 py-1 text-sm"
                              >
                                Login to Reply
                              </Button>
                            )}
                            <span className="text-xs text-gray-400">
                              {(comment.replies?.length ?? 0) + " replies"}
                            </span>
                          </div>
                        ) : null}

                        {replyingToCommentId === comment.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void handleReplySubmit(comment.id, e);
                            }}
                            className="mt-3 space-y-2"
                          >
                            <textarea
                              value={replyDraft}
                              onChange={(e) => setReplyDraft(e.target.value)}
                              className="w-full min-h-[80px] rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:shadow-[inset_0_0_0_1px_#007E6E]"
                              placeholder="Write a helpful reply..."
                              maxLength={600}
                            />
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  setReplyingToCommentId(null);
                                  setReplyDraft("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={postingReply || replyDraft.trim().length === 0}
                              >
                                {postingReply ? "Replying..." : "Post Reply"}
                              </Button>
                            </div>
                          </form>
                        ) : null}

                        {comment.replies?.length ? (
                          <ul className="mt-3 space-y-3 pl-4 border-l border-gray-100">
                            {comment.replies.map((reply) => (
                              <li
                                key={reply.id}
                                className="rounded-lg border border-gray-100 bg-white/40 p-3"
                              >
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {reply.user.name ?? "Farmer"}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-400">
                                      {formatDateTime(reply.createdAt)}
                                    </p>
                                    {isCommentOwned(reply) ? (
                                      <div className="flex items-center gap-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          onClick={() =>
                                            void handleStartEdit(reply.id)
                                          }
                                          className="h-8 w-8 !px-0 !py-0 p-0 justify-center rounded-lg border border-forest/20 bg-leaf/10 text-forest hover:bg-leaf/20"
                                        >
                                          <FiEdit2 size={16} />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          onClick={() =>
                                            void handleRequestDeleteComment(
                                              reply.id
                                            )
                                          }
                                          className="h-8 w-8 !px-0 !py-0 p-0 justify-center rounded-lg border border-forest/20 bg-leaf/10 text-forest hover:bg-leaf/20"
                                          disabled={deletingComment}
                                        >
                                          <FiTrash2 size={16} />
                                        </Button>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>

                                {editingCommentId === reply.id ? (
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      void handleSaveEditedComment(reply.id);
                                    }}
                                    className="space-y-2"
                                  >
                                    <textarea
                                      value={editingCommentDraft}
                                      onChange={(e) =>
                                        setEditingCommentDraft(e.target.value)
                                      }
                                      className="w-full min-h-[80px] rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:shadow-[inset_0_0_0_1px_#007E6E]"
                                      maxLength={600}
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => void handleCancelEdit()}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="submit"
                                        disabled={
                                          editingCommentDraft.trim().length === 0
                                        }
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </form>
                                ) : (
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                    {reply.content}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
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

      {showDeleteCommentModal && deleteCommentId ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-comment-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#0f0c09]/70 backdrop-blur-[2px]"
            onClick={() =>
              !deletingComment && void handleCancelDeleteCommentModal()
            }
            aria-label="Close delete comment confirmation"
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
                id="delete-comment-title"
                className="text-xl font-semibold tracking-tight text-[#f7f2df]"
              >
                Delete this comment permanently?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#e7deaf]/80">
                This will remove your comment from the thread and cannot be undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  disabled={deletingComment}
                  onClick={() => void handleCancelDeleteCommentModal()}
                  className="!border !border-[#d7c097]/35 !bg-[#e7deaf]/10 !text-[#f8f3df] hover:!bg-[#e7deaf]/20"
                >
                  Cancel
                </Button>
                <Button
                  disabled={deletingComment}
                  onClick={() => void handleConfirmDeleteComment(deleteCommentId)}
                  className="!bg-red-600 !text-white hover:!bg-red-500"
                >
                  <FiTrash2 size={16} />
                  {deletingComment ? "Deleting..." : "Delete Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

