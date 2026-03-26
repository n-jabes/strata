export const PROFILE_EXPERIENCE_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
] as const;

export type ProfileExperienceLevel = (typeof PROFILE_EXPERIENCE_LEVELS)[number];

export const PROFILE_SOIL_TYPES = [
  "Sandy",
  "Loamy",
  "Clay",
  "Silty",
  "Peaty",
  "Chalky",
  "Other",
] as const;

