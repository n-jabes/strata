import { z } from "zod";
import {
  COMMUNITY_POST_CATEGORIES,
  COMMUNITY_POST_TYPES,
} from "@/lib/community-posts";

const hashtagSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .transform((tag) => tag.replace(/^#+/, "").toLowerCase());

const hashtagsArraySchema = z
  .array(hashtagSchema)
  .max(20)
  .transform((tags) => Array.from(new Set(tags.filter(Boolean))));

const mediaUrlSchema = z
  .string()
  .trim()
  .url("mediaUrl must be a valid URL")
  .optional()
  .or(z.literal(""));

export const createPostSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(10).max(2000),
    type: z.enum(COMMUNITY_POST_TYPES),
    category: z.enum(COMMUNITY_POST_CATEGORIES),
    mediaUrl: mediaUrlSchema,
    hashtags: hashtagsArraySchema.default([]),
  })
  .superRefine((data, ctx) => {
    const normalizedMediaUrl = data.mediaUrl ? data.mediaUrl.trim() : undefined;
    const requiresMedia = data.type === "IMAGE" || data.type === "VIDEO";

    if (requiresMedia && !normalizedMediaUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["mediaUrl"],
        message: `${data.type} posts require mediaUrl.`,
      });
    }
  })
  .transform((data) => ({
    ...data,
    mediaUrl: data.mediaUrl ? data.mediaUrl.trim() : undefined,
  }));

export const updatePostSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().min(10).max(2000).optional(),
    type: z.enum(COMMUNITY_POST_TYPES).optional(),
    category: z.enum(COMMUNITY_POST_CATEGORIES).optional(),
    mediaUrl: mediaUrlSchema,
    hashtags: hashtagsArraySchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type && (data.type === "IMAGE" || data.type === "VIDEO")) {
      const mediaUrl = data.mediaUrl ? data.mediaUrl.trim() : undefined;
      if (!mediaUrl) {
        ctx.addIssue({
          code: "custom",
          path: ["mediaUrl"],
          message: `${data.type} posts require mediaUrl.`,
        });
      }
    }
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update.",
  })
  .transform((data) => ({
    ...data,
    mediaUrl: data.mediaUrl ? data.mediaUrl.trim() : data.mediaUrl,
  }));

export const listPostsQuerySchema = z.object({
  category: z.enum(COMMUNITY_POST_CATEGORIES).optional(),
  hashtags: z
    .string()
    .optional()
    .transform((raw) =>
      raw
        ? Array.from(
            new Set(
              raw
                .split(",")
                .map((tag) => tag.trim().replace(/^#+/, "").toLowerCase())
                .filter(Boolean)
            )
          )
        : []
    ),
  search: z.string().trim().max(120).optional(),
  take: z.coerce.number().int().min(1).max(50).optional().default(20),
  skip: z.coerce.number().int().min(0).max(1000).optional().default(0),
});
