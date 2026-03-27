import type {
  CommunityPostCategory,
  CommunityPostType,
} from "@/lib/community-posts";

// Re-export so local API client can import category from this module.
export type { CommunityPostCategory };

export type CommunityPostUser = {
  id: string;
  name: string | null;
  email: string | null;
};

export type CommunityPostCounts = {
  comments: number;
  likes: number;
};

export type CommunityPostComment = {
  id: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
  user: CommunityPostUser;
  parentCommentId?: string | null;
  replies?: CommunityPostComment[];
};

export type CommunityPost = {
  id: string;
  title: string;
  description: string;
  type: CommunityPostType;
  mediaUrl?: string | null;
  hashtags: string[];
  category: CommunityPostCategory;
  userId: string;
  user: CommunityPostUser;
  _count?: CommunityPostCounts | null;
  viewerHasAppreciated?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

