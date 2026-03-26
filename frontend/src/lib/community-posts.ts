export const COMMUNITY_POST_TYPES = ["TEXT", "IMAGE", "VIDEO"] as const;
export type CommunityPostType = (typeof COMMUNITY_POST_TYPES)[number];

export const COMMUNITY_POST_CATEGORIES = [
  "TIP",
  "GUIDE",
  "QUESTION",
  "EXPERIENCE",
] as const;
export type CommunityPostCategory = (typeof COMMUNITY_POST_CATEGORIES)[number];

export const COMMUNITY_MEDIA_LIMIT_MB = 20;
export const COMMUNITY_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const COMMUNITY_ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;
