import type {
  CommunityPost,
  CommunityPostCategory,
  CommunityPostComment,
} from "./types";

type GetPostsParams = {
  category?: CommunityPostCategory;
  hashtags?: string; // comma-separated
  search?: string;
  sort?: "NEWEST" | "TOP";
  take?: number;
  skip?: number;
};

export type CommunityPostsMeta = {
  count: number;
  total: number;
  take: number;
  skip: number;
  nextSkip: number | null;
  hasMore: boolean;
};

export async function getPosts(params: GetPostsParams): Promise<{
  posts: CommunityPost[];
  meta?: CommunityPostsMeta;
}> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.hashtags) qs.set("hashtags", params.hashtags);
  if (params.search) qs.set("search", params.search);
  if (params.sort) qs.set("sort", params.sort);
  qs.set("take", String(params.take ?? 20));
  qs.set("skip", String(params.skip ?? 0));

  const res = await fetch(`/api/posts?${qs.toString()}`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to load posts (${res.status}).`);
  }

  const json = (await res.json()) as {
    posts: CommunityPost[];
    meta?: CommunityPostsMeta;
  };

  return json;
}

export async function getPostById(postId: string): Promise<CommunityPost> {
  const res = await fetch(`/api/posts/${postId}`, { method: "GET" });
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!res.ok) {
    throw new Error(`Failed to load post (${res.status}).`);
  }
  return (await res.json()).post as CommunityPost;
}

export async function createPostRequest(payload: unknown): Promise<{
  post: CommunityPost;
}> {
  const res = await fetch(`/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => ({}))) as { post?: CommunityPost; error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? `Failed to create post (${res.status}).`);
  }
  if (!json.post) {
    throw new Error("Post not returned by API.");
  }
  return { post: json.post };
}

export async function deletePostRequest(postId: string): Promise<void> {
  const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error ?? `Failed to delete post (${res.status}).`);
  }
}

export async function toggleAppreciateRequest(postId: string): Promise<{
  appreciated: boolean;
  appreciates: number;
}> {
  const res = await fetch(`/api/posts/${postId}/appreciate`, { method: "POST" });
  const json = (await res.json().catch(() => ({}))) as {
    appreciated?: boolean;
    appreciates?: number;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(json.error ?? `Failed to appreciate post (${res.status}).`);
  }
  return {
    appreciated: !!json.appreciated,
    appreciates: Number(json.appreciates ?? 0),
  };
}

export async function getPostCommentsRequest(postId: string): Promise<{
  comments: CommunityPostComment[];
  total: number;
}> {
  const res = await fetch(`/api/posts/${postId}/comments`, { method: "GET" });
  const json = (await res.json().catch(() => ({}))) as {
    comments?: CommunityPostComment[];
    total?: number;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(json.error ?? `Failed to load comments (${res.status}).`);
  }
  return { comments: json.comments ?? [], total: Number(json.total ?? (json.comments?.length ?? 0)) };
}

export async function createPostCommentRequest(
  postId: string,
  content: string,
  parentCommentId?: string | null
): Promise<{
  comment: CommunityPostComment;
  comments: number;
}> {
  const res = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, parentCommentId }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    comment?: CommunityPostComment;
    comments?: number;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(json.error ?? `Failed to create comment (${res.status}).`);
  }
  if (!json.comment) {
    throw new Error("Comment not returned by API.");
  }
  return {
    comment: json.comment,
    comments: Number(json.comments ?? 0),
  };
}

export async function editPostCommentRequest(
  postId: string,
  commentId: string,
  content: string
): Promise<{
  comment: CommunityPostComment;
  comments: number;
}> {
  const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    comment?: CommunityPostComment;
    comments?: number;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(json.error ?? `Failed to edit comment (${res.status}).`);
  }
  if (!json.comment) {
    throw new Error("Comment not returned by API.");
  }

  return {
    comment: json.comment,
    comments: Number(json.comments ?? 0),
  };
}

export async function deletePostCommentRequest(
  postId: string,
  commentId: string
): Promise<{
  success: boolean;
  comments: number;
}> {
  const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });

  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    comments?: number;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(json.error ?? `Failed to delete comment (${res.status}).`);
  }

  return {
    success: !!json.success,
    comments: Number(json.comments ?? 0),
  };
}

