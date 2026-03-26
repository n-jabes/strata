import type { CommunityPost, CommunityPostCategory } from "./types";

type GetPostsParams = {
  category?: CommunityPostCategory;
  hashtags?: string; // comma-separated
  search?: string;
  take?: number;
  skip?: number;
};

export async function getPosts(params: GetPostsParams): Promise<{
  posts: CommunityPost[];
  meta?: { count: number; take: number; skip: number };
}> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.hashtags) qs.set("hashtags", params.hashtags);
  if (params.search) qs.set("search", params.search);
  qs.set("take", String(params.take ?? 20));
  qs.set("skip", String(params.skip ?? 0));

  const res = await fetch(`/api/posts?${qs.toString()}`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to load posts (${res.status}).`);
  }

  const json = (await res.json()) as {
    posts: CommunityPost[];
    meta?: { count: number; take: number; skip: number };
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

