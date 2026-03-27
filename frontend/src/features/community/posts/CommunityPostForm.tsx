"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { COMMUNITY_POST_CATEGORIES, COMMUNITY_POST_TYPES } from "@/lib/community-posts";
import { createPostSchema } from "./schemas";
import type { CommunityPostType, CommunityPostCategory } from "@/lib/community-posts";
import { FiImage, FiVideo, FiFileText, FiUpload, FiLoader } from "react-icons/fi";
import { FadeIn } from "@/components/animations/fade-in";
import type { ZodError } from "zod";

type FieldErrors = Partial<Record<string, string>>;

function parseHashtagsInput(raw: string): string[] {
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((t) => t.replace(/^#+/, ""));

  return Array.from(new Set(parts)).slice(0, 20);
}

function getFieldError(error: unknown) {
  const flattened = (error as { flatten?: () => { fieldErrors: unknown } })
    .flatten?.();
  const fieldErrors = (flattened?.fieldErrors ?? {}) as Record<string, unknown>;
  const next: FieldErrors = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    const messageList = messages as unknown as string[] | undefined;
    if (messageList && messageList.length > 0) {
      next[field] = messageList[0];
    }
  }
  return next;
}

export function CommunityPostForm() {
  const router = useRouter();
  const { toast } = useToast();

  const typeOptions = useMemo(
    () =>
      COMMUNITY_POST_TYPES.map((t) => ({
        value: t,
        label: t.charAt(0) + t.slice(1).toLowerCase(),
      })),
    []
  );

  const categoryOptions = useMemo(
    () =>
      COMMUNITY_POST_CATEGORIES.map((c) => ({
        value: c,
        label: c
          .toLowerCase()
          .replace(/\b\w/g, (m) => m.toUpperCase()),
      })),
    []
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CommunityPostType>("TEXT");
  const [category, setCategory] = useState<CommunityPostCategory>("TIP");
  const [hashtagsText, setHashtagsText] = useState("");

  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const requiresMedia = type === "IMAGE" || type === "VIDEO";

  useEffect(() => {
    setUploadError(null);
    if (!requiresMedia) {
      setMediaUrl(undefined);
      setMediaPreview(null);
    }
  }, [requiresMedia]);

  async function handleUpload(file: File) {
    setUploadError(null);
    setUploading(true);

    try {
      if (requiresMedia) {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (type === "IMAGE" && !isImage) {
          throw new Error("Please choose an image file for IMAGE posts.");
        }
        if (type === "VIDEO" && !isVideo) {
          throw new Error("Please choose a video file for VIDEO posts.");
        }
      }

      // Client upload -> server endpoint that uploads to Cloudinary.
      const formData = new FormData();
      formData.append("media", file);

      const res = await fetch("/api/posts/media/upload", {
        method: "POST",
        body: formData,
      });

      const json = (await res.json().catch(() => ({}))) as {
        mediaUrl?: string;
        error?: string;
      };

      if (!res.ok || !json.mediaUrl) {
        throw new Error(json.error ?? `Upload failed (${res.status}).`);
      }

      setMediaUrl(json.mediaUrl);
      setMediaPreview(json.mediaUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
      toast(message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const payload = {
      title: title.trim(),
      description: description.trim(),
      type,
      category,
      mediaUrl: mediaUrl ?? undefined,
      hashtags: parseHashtagsInput(hashtagsText),
    };

    const parsed = createPostSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(getFieldError(parsed));
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = (await res.json().catch(() => ({}))) as { post?: { id: string }; error?: string };

      if (!res.ok || !json.post?.id) {
        throw new Error(json.error ?? `Failed to create post (${res.status}).`);
      }

      toast("Post published successfully!", "success");
      router.push(`/community/${json.post.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create post";
      toast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const typeIcon = useMemo(() => {
    if (type === "IMAGE") return FiImage;
    if (type === "VIDEO") return FiVideo;
    return FiFileText;
  }, [type]);

  return (
    <FadeIn>
      <Card className="rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
              {(() => {
                const Icon = typeIcon;
                return <Icon size={20} />;
              })()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Create a Post</h1>
              <p className="text-sm text-gray-500 mt-1">
                Share tips, guides, questions, or experiences with the community.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="title"
              label="Title"
              placeholder="e.g. Terracing improves soil moisture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
            />
            <Select
              id="type"
              label="Type"
              value={type}
              onChange={(v) => setType(v as CommunityPostType)}
              options={typeOptions}
              error={errors.type}
            />
            <Select
              id="category"
              label="Category"
              value={category}
              onChange={(v) => setCategory(v as CommunityPostCategory)}
              options={categoryOptions}
              placeholder="Choose a category"
              error={errors.category}
            />
            <Input
              id="hashtags"
              label="Hashtags (comma-separated)"
              placeholder="e.g. soil,terraces,beans"
              value={hashtagsText}
              onChange={(e) => setHashtagsText(e.target.value)}
              error={errors.hashtags}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={
                "w-full min-h-[140px] rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 " +
                "outline-none transition-all duration-200 focus:border-forest focus:shadow-[inset_0_0_0_1px_#007E6E] " +
                (errors.description
                  ? "border-red-400 focus:border-red-400 focus:shadow-[inset_0_0_0_1px_#ef4444]"
                  : "")
              }
              placeholder="Write your post content..."
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {requiresMedia && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Media Upload</p>
                <span className="text-xs text-gray-500">{`Max ${20}MB · ${type === "IMAGE" ? "Images" : "Videos"}`}</span>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept={type === "IMAGE" ? "image/*" : "video/*"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void handleUpload(file);
                  }}
                  className="block w-full text-sm text-gray-600"
                  disabled={uploading}
                />
              </div>

              {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiLoader className="animate-spin" /> Uploading…
                </div>
              )}

              {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

              {mediaPreview && (
                <div className="rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                  {type === "IMAGE" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaPreview} alt="Uploaded media preview" className="w-full max-h-72 object-cover" />
                  ) : (
                    <video src={mediaPreview} controls className="w-full max-h-72 object-cover" />
                  )}
                </div>
              )}

              {errors.mediaUrl && <p className="text-xs text-red-500">{errors.mediaUrl}</p>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch">
            <Link
              href="/community"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              className="w-full sm:w-auto justify-center"
            >
              {isSubmitting ? "Publishing…" : "Publish Post"}
              <FiUpload size={15} />
            </Button>
          </div>
        </form>
      </Card>
    </FadeIn>
  );
}

