import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadCommunityPostMedia } from "@/features/community/posts/media-upload";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json(
      { error: "Invalid form data." },
      { status: 400 }
    );
  }

  const file = formData.get("media");
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "media file is required (field name: media)." },
      { status: 400 }
    );
  }

  try {
    const upload = await uploadCommunityPostMedia({
      name: file.name,
      type: file.type,
      size: file.size,
      arrayBuffer: () => file.arrayBuffer(),
    });

    // Store ONLY mediaUrl in DB; the client will persist it in `Post.mediaUrl`.
    return NextResponse.json(upload, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

