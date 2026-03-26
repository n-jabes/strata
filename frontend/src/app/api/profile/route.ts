import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateProfileSchema } from "@/features/profile/schemas";
import { getProfile, updateProfile } from "@/features/profile/service";

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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(json);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const profile = await updateProfile(session.user.id, parsed.data);
  return NextResponse.json({ profile });
}

