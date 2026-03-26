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
  farmSize: z
    .union([z.coerce.number().min(0).max(1_000_000), z.literal(""), z.undefined()])
    .transform((value) => (value === "" || value === undefined ? undefined : value)),
  soilType: optionalString(80),
  experienceLevel: z
    .enum(PROFILE_EXPERIENCE_LEVELS)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
});

