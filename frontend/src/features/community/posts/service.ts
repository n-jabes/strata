import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type {
  createPostSchema,
  listPostsQuerySchema,
  updatePostSchema,
} from "./schemas";
import type { z } from "zod";

type CreatePostInput = z.infer<typeof createPostSchema>;
type UpdatePostInput = z.infer<typeof updatePostSchema>;
type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

const postInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      comments: true,
      likes: true,
    },
  },
} satisfies Prisma.PostInclude;

export async function createPost(userId: string, input: CreatePostInput) {
  return prisma.post.create({
    data: {
      userId,
      title: input.title,
      description: input.description,
      type: input.type,
      category: input.category,
      mediaUrl: input.mediaUrl,
      hashtags: input.hashtags,
    },
    include: postInclude,
  });
}

export async function listPosts(query: ListPostsQuery) {
  const where: Prisma.PostWhereInput = {};

  if (query.category) {
    where.category = query.category;
  }
  if (query.hashtags.length > 0) {
    where.hashtags = { hasSome: query.hashtags };
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip: query.skip,
      take: query.take,
      orderBy: { createdAt: "desc" },
      include: postInclude,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total };
}

export async function getPostById(postId: string) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: postInclude,
  });
}

export async function updatePost(postId: string, input: UpdatePostInput) {
  return prisma.post.update({
    where: { id: postId },
    data: input,
    include: postInclude,
  });
}

export async function deletePost(postId: string) {
  await prisma.post.delete({
    where: { id: postId },
  });
}
