import { z } from "zod";
import { PROFILE_EXPERIENCE_LEVELS } from "./constants";

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value && value.trim() ? value.trim() : undefined));

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  location: optionalString(120),
  bio: optionalString(500),
  profilePicture: z
    .string()
    .trim()
    .url("profilePicture must be a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value && value.trim() ? value.trim() : undefined)),
  experienceLevel: z
    .enum(PROFILE_EXPERIENCE_LEVELS)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
});

