"use client";

import { useMemo, useState } from "react";
import type { CommunityPost } from "./types";

type EngagementState = {
  likes: number;
  comments: number;
};

/**
 * Local engagement state scaffold for future likes/comments API integration.
 * Keeps usage stable while backend endpoints evolve.
 */
export function usePostEngagement(post: Pick<CommunityPost, "id" | "_count">) {
  const initial = useMemo<EngagementState>(
    () => ({
      likes: post._count?.likes ?? 0,
      comments: post._count?.comments ?? 0,
    }),
    [post._count?.likes, post._count?.comments]
  );

  const [state, setState] = useState<EngagementState>(initial);

  function incrementLikes(delta = 1) {
    setState((prev) => ({ ...prev, likes: Math.max(0, prev.likes + delta) }));
  }

  function incrementComments(delta = 1) {
    setState((prev) => ({ ...prev, comments: Math.max(0, prev.comments + delta) }));
  }

  return {
    postId: post.id,
    likes: state.likes,
    comments: state.comments,
    incrementLikes,
    incrementComments,
  };
}

