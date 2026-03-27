import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import {
  deletePostComment,
  editPostComment,
} from "@/features/community/posts/service";
import { hasPermission } from "@/lib/auth/rbac";

const editCommentSchema = z.object({
  content: z.string().trim().min(1).max(600),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId, commentId } = await context.params;
  const json = await request.json().catch(() => null);
  const parsed = editCommentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid comment." }, { status: 400 });
  }

  try {
    const result = await editPostComment(
      postId,
      commentId,
      session.user.id,
      parsed.data.content
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "COMMENT_NOT_FOUND") {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Failed to update comment." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId, commentId } = await context.params;
  const isAdmin = hasPermission(session.user.role, "community.comments.delete.any");
  try {
    const result = await deletePostComment(postId, commentId, session.user.id, isAdmin);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "COMMENT_NOT_FOUND") {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Failed to delete comment." }, { status: 500 });
  }
}

