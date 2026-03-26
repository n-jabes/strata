import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPostComment, listPostComments } from "@/features/community/posts/service";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(600),
  parentCommentId: z.string().uuid().optional().nullable(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const result = await listPostComments(id);
  return NextResponse.json(result);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createCommentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid comment." }, { status: 400 });
  }

  const { id } = await context.params;
  try {
    const result = await createPostComment(
      id,
      session.user.id,
      parsed.data.content,
      parsed.data.parentCommentId ?? null
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "POST_NOT_FOUND") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to create comment." }, { status: 500 });
  }
}
