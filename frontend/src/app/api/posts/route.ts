import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createPostSchema,
  listPostsQuerySchema,
} from "@/features/community/posts/schemas";
import { createPost, listPosts } from "@/features/community/posts/service";

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

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createPostSchema.safeParse(json);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const post = await createPost(session.user.id, parsed.data);
  return NextResponse.json({ post }, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listPostsQuerySchema.safeParse({
    category: searchParams.get("category") ?? undefined,
    hashtags: searchParams.get("hashtags") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    take: searchParams.get("take") ?? undefined,
    skip: searchParams.get("skip") ?? undefined,
  });

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const posts = await listPosts(parsed.data);
  return NextResponse.json({
    posts,
    meta: {
      count: posts.length,
      skip: parsed.data.skip,
      take: parsed.data.take,
    },
  });
}
