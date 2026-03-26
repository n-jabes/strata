import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { updateProfileSchema } from "./schemas";
import type { z } from "zod";

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

function isMissingColumnError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2022"
  );
}

export async function getProfile(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        bio: true,
        profilePicture: true,
        farmSize: true,
        soilType: true,
        experienceLevel: true,
        createdAt: true,
        farms: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            location: true,
            size: true,
            createdAt: true,
            _count: { select: { analyses: true } },
          },
        },
        posts: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            createdAt: true,
            _count: { select: { comments: true, likes: true } },
          },
        },
      },
    });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const baseProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        farms: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            location: true,
            size: true,
            createdAt: true,
            _count: { select: { analyses: true } },
          },
        },
        posts: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            createdAt: true,
            _count: { select: { comments: true, likes: true } },
          },
        },
      },
    });

    if (!baseProfile) return null;

    return {
      ...baseProfile,
      location: null,
      bio: null,
      profilePicture: null,
      farmSize: null,
      soilType: null,
      experienceLevel: null,
    };
  }
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const data: Prisma.UserUpdateInput = {
    name: input.name,
    location: input.location,
    bio: input.bio,
    profilePicture: input.profilePicture,
    farmSize: input.farmSize,
    soilType: input.soilType,
    experienceLevel: input.experienceLevel,
  };

  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        bio: true,
        profilePicture: true,
        farmSize: true,
        soilType: true,
        experienceLevel: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    return prisma.user.update({
      where: { id: userId },
      data: { name: input.name },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }
}

