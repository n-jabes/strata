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

type PostWithViewerInclude = Prisma.PostGetPayload<{
  include: typeof postInclude & {
    likes: {
      select: { userId: true };
    };
  };
}>;

function mapPostWithViewer(post: PostWithViewerInclude, viewerId?: string) {
  const { likes, ...rest } = post;
  return {
    ...rest,
    viewerHasAppreciated: !!viewerId && likes.length > 0,
  };
}

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

  const sort = query.sort ?? "NEWEST";

  const orderBy: Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[] =
    sort === "TOP"
      ? [
          { likes: { _count: "desc" } },
          { createdAt: "desc" },
        ]
      : [{ createdAt: "desc" }];

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip: query.skip,
      take: query.take,
      orderBy,
      include: postInclude,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total };
}

export async function getPostById(postId: string, viewerId?: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      ...postInclude,
      likes: {
        where: { userId: viewerId ?? "" },
        select: { userId: true },
        take: 1,
      },
    },
  });
  if (!post) return null;
  return mapPostWithViewer(post, viewerId);
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

export async function togglePostAppreciation(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.postLike.delete({
      where: { postId_userId: { postId, userId } },
    });
  } else {
    await prisma.postLike.create({
      data: { postId, userId },
    });
  }

  const appreciates = await prisma.postLike.count({ where: { postId } });
  return {
    appreciated: !existing,
    appreciates,
  };
}

export async function listPostComments(postId: string) {
  const [topLevel, total] = await Promise.all([
    prisma.postComment.findMany({
      where: { postId, parentCommentId: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        parentCommentId: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.postComment.count({ where: { postId } }),
  ]);

  const topLevelIds = topLevel.map((c) => c.id);
  const replies = topLevelIds.length
    ? await prisma.postComment.findMany({
        where: {
          postId,
          parentCommentId: { in: topLevelIds },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          parentCommentId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      })
    : [];

  const repliesByParent = new Map<string, typeof replies>();
  for (const r of replies) {
    const pid = r.parentCommentId as string;
    const existing = repliesByParent.get(pid);
    if (existing) existing.push(r);
    else repliesByParent.set(pid, [r]);
  }

  return {
    comments: topLevel.map((c) => ({
      ...c,
      replies: repliesByParent.get(c.id) ?? [],
    })),
    total,
  };
}

export async function createPostComment(
  postId: string,
  userId: string,
  content: string,
  parentCommentId: string | null
) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  if (parentCommentId) {
    const parent = await prisma.postComment.findUnique({
      where: { id: parentCommentId },
      select: { id: true, postId: true, parentCommentId: true },
    });

    if (!parent || parent.postId !== postId || parent.parentCommentId !== null) {
      throw new Error("INVALID_PARENT_COMMENT");
    }
  }

  const comment = await prisma.postComment.create({
    data: {
      postId,
      userId,
      content,
      parentCommentId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      parentCommentId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const comments = await prisma.postComment.count({ where: { postId } });
  return { comment, comments };
}

export async function editPostComment(
  postId: string,
  commentId: string,
  userId: string,
  content: string,
  isAdmin = false
) {
  const existing = await prisma.postComment.findUnique({
    where: { id: commentId },
    select: { id: true, postId: true, userId: true },
  });

  if (!existing) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  if (existing.postId !== postId || (existing.userId !== userId && !isAdmin)) {
    throw new Error("FORBIDDEN");
  }

  const updated = await prisma.postComment.update({
    where: { id: commentId },
    data: { content },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      parentCommentId: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const comments = await prisma.postComment.count({ where: { postId } });
  return { comment: updated, comments };
}

export async function deletePostComment(
  postId: string,
  commentId: string,
  userId: string,
  isAdmin = false
) {
  const existing = await prisma.postComment.findUnique({
    where: { id: commentId },
    select: { id: true, postId: true, userId: true },
  });

  if (!existing) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  if (existing.postId !== postId || (existing.userId !== userId && !isAdmin)) {
    throw new Error("FORBIDDEN");
  }

  await prisma.postComment.delete({
    where: { id: commentId },
  });

  const comments = await prisma.postComment.count({ where: { postId } });
  return { success: true, comments };
}
