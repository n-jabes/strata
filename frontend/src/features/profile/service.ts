import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { updateProfileSchema } from "./schemas";
import type { z } from "zod";

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function getProfile(userId: string) {
  return prisma.user.findUnique({
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

  return prisma.user.update({
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
}

