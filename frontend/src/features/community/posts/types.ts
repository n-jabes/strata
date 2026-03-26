import type { CommunityPostCategory, CommunityPostType } from "@/lib/community-posts";

export type CommunityPostUser = {
  id: string;
  name: string | null;
  email: string | null;
};

export type CommunityPostCounts = {
  comments: number;
  likes: number;
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
  createdAt: string | Date;
  updatedAt: string | Date;
};

