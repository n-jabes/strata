import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { togglePostAppreciation } from "@/features/community/posts/service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const result = await togglePostAppreciation(id, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "POST_NOT_FOUND") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update appreciation." }, { status: 500 });
  }
}
