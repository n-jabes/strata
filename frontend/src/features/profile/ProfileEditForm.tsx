"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PROFILE_EXPERIENCE_LEVELS } from "./constants";
import { updateProfileSchema } from "./schemas";

type ProfileFormData = {
  name: string;
  location: string;
  bio: string;
  profilePicture: string;
  experienceLevel: string;
};

type ProfilePayload = {
  name: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  experienceLevel?: (typeof PROFILE_EXPERIENCE_LEVELS)[number];
};

export function ProfileEditForm({ initialData }: { initialData: ProfileFormData }) {
  const [form, setForm] = useState<ProfileFormData>(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const experienceOptions = PROFILE_EXPERIENCE_LEVELS.map((level) => ({
    value: level,
    label: level.charAt(0) + level.slice(1).toLowerCase(),
  }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const payload: ProfilePayload = {
        name: form.name,
        location: form.location,
        bio: form.bio,
        profilePicture: form.profilePicture,
        experienceLevel:
          form.experienceLevel === ""
            ? undefined
            : (form.experienceLevel as (typeof PROFILE_EXPERIENCE_LEVELS)[number]),
      };

      const parsed = updateProfileSchema.safeParse(payload);
      if (!parsed.success) {
        setError("Please fix the highlighted profile values.");
        return;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? `Failed to update profile (${res.status}).`);
      }
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="name"
          label="Name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
        <Input
          id="location"
          label="Location"
          value={form.location}
          onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
        />
        <Input
          id="profilePicture"
          label="Profile Picture URL"
          value={form.profilePicture}
          onChange={(e) => setForm((prev) => ({ ...prev, profilePicture: e.target.value }))}
        />
        <Select
          id="experienceLevel"
          label="Experience Level"
          value={form.experienceLevel}
          onChange={(value) => setForm((prev) => ({ ...prev, experienceLevel: value }))}
          options={experienceOptions}
          placeholder="Select level"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
          className="w-full min-h-[120px] rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-forest focus:shadow-[inset_0_0_0_1px_#007E6E]"
          placeholder="Tell others about your farming background..."
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}

