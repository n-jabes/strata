import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updatePostSchema } from "@/features/community/posts/schemas";
import {
  deletePost,
  getPostById,
  updatePost,
} from "@/features/community/posts/service";
import { hasPermission } from "@/lib/auth/rbac";

function zodErrorResponse(error: { flatten: () => { fieldErrors: unknown; formErrors: unknown } }) {
  const flattened = error.flatten();
  return NextResponse.json(
    {
      error: "Validation failed",
      details: {
        fieldErrors: flattened.fieldErrors,
        formErrors: flattened.formErrors,
      },
    },
    { status: 400 }
  );
}

async function getOwnedPost(postId: string, userId: string, role?: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, userId: true },
  });

  if (!post) {
    return { status: 404 as const, error: "Post not found" };
  }
  const canDeleteAny = hasPermission(role, "community.posts.delete.any");
  if (post.userId !== userId && !canDeleteAny) {
    return { status: 403 as const, error: "Forbidden" };
  }

  return { status: 200 as const };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await context.params;
  const post = await getPostById(id, session?.user?.id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const ownership = await getOwnedPost(id, session.user.id, session.user.role);
  if (ownership.status !== 200) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  const json = await request.json().catch(() => null);
  const parsed = updatePostSchema.safeParse(json);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const post = await updatePost(id, parsed.data);
  return NextResponse.json({ post });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const ownership = await getOwnedPost(id, session.user.id, session.user.role);
  if (ownership.status !== 200) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  await deletePost(id);
  return NextResponse.json({ success: true });
}
