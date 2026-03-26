import { COMMUNITY_ALLOWED_IMAGE_TYPES, COMMUNITY_ALLOWED_VIDEO_TYPES, COMMUNITY_MEDIA_LIMIT_MB } from "@/lib/community-posts";
import { COMMUNITY_UPLOAD_FOLDER, getCloudinary } from "@/lib/cloudinary";

function assertIsAllowedMedia(mimeType: string) {
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");

  if (!isImage && !isVideo) {
    throw new Error("Only image or video uploads are allowed.");
  }

  if (isImage) {
    const ok = (COMMUNITY_ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType);
    if (!ok) throw new Error("Unsupported image type.");
    return "image" as const;
  }

  const ok = (COMMUNITY_ALLOWED_VIDEO_TYPES as readonly string[]).includes(mimeType);
  if (!ok) throw new Error("Unsupported video type.");
  return "video" as const;
}

function formatMb(bytes: number) {
  return Math.round((bytes / 1024 / 1024) * 10) / 10;
}

export async function uploadCommunityPostMedia(file: {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
}) {
  if (!file) throw new Error("Missing file.");
  const mimeType = file.type;

  if (!mimeType) throw new Error("Missing file content type.");

  const maxBytes = COMMUNITY_MEDIA_LIMIT_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      `File too large. Max ${COMMUNITY_MEDIA_LIMIT_MB}MB, got ${formatMb(file.size)}MB.`
    );
  }

  const resourceType = assertIsAllowedMedia(mimeType);

  const buffer = Buffer.from(await file.arrayBuffer());

  const cloudinary = getCloudinary();

  const result = await new Promise<{
    secure_url?: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: COMMUNITY_UPLOAD_FOLDER,
        resource_type: resourceType,
        public_id: `community_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        overwrite: false,
      },
      (err, uploadResult) => {
        if (err) return reject(err);
        resolve(uploadResult as any);
      }
    );

    stream.end(buffer);
  });

  if (!result.secure_url) {
    throw new Error("Cloudinary upload did not return a secure_url.");
  }

  return { mediaUrl: result.secure_url };
}

