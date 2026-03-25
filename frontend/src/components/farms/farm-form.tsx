"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createFarm } from "@/features/farms/actions/create-farm";

type FormValues = {
  name: string;
  location: string;
  size: string;
  altitude: string;
  latitude: string;
  longitude: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Farm name is required.";
  if (!values.location.trim()) errors.location = "Location is required.";
  const size = parseFloat(values.size);
  if (!values.size || isNaN(size) || size <= 0)
    errors.size = "Farm size must be a positive number.";
  if (values.altitude) {
    const alt = parseFloat(values.altitude);
    if (isNaN(alt) || alt < 0)
      errors.altitude = "Altitude must be a positive number.";
  }

  if (values.latitude) {
    const lat = parseFloat(values.latitude);
    if (isNaN(lat)) errors.latitude = "Latitude must be a valid number.";
    if (!isNaN(lat) && (lat < -90 || lat > 90))
      errors.latitude = "Latitude must be between -90 and 90.";
  }

  if (values.longitude) {
    const lng = parseFloat(values.longitude);
    if (isNaN(lng))
      errors.longitude = "Longitude must be a valid number.";
    if (!isNaN(lng) && (lng < -180 || lng > 180))
      errors.longitude = "Longitude must be between -180 and 180.";
  }

  return errors;
}

export function FarmForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = useState<FormValues>({
    name: "",
    location: "",
    size: "",
    altitude: "",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    const result = await createFarm({
      name: values.name.trim(),
      location: values.location.trim(),
      size: parseFloat(values.size),
      altitude: values.altitude ? parseFloat(values.altitude) : null,
      latitude: values.latitude ? parseFloat(values.latitude) : null,
      longitude: values.longitude ? parseFloat(values.longitude) : null,
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast(result.error, "error");
      return;
    }

    toast("Farm created successfully!", "success");
    router.push("/farms");
  };

  return (
    <form
      onSubmit={(e) => { void handleSubmit(e); }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5 max-w-lg"
    >
      <Input
        id="name"
        label="Farm Name"
        placeholder="e.g. Ngorongoro Highland Farm"
        value={values.name}
        onChange={set("name")}
        error={errors.name}
      />

      <Input
        id="location"
        label="Location"
        placeholder="e.g. Musanze, Rwanda"
        value={values.location}
        onChange={set("location")}
        error={errors.location}
      />

      <Input
        id="size"
        label="Farm Size (hectares)"
        type="number"
        min="0"
        step="0.1"
        placeholder="e.g. 5.0"
        value={values.size}
        onChange={set("size")}
        error={errors.size}
      />

      <Input
        id="altitude"
        label="Altitude (meters) — Optional"
        type="number"
        min="0"
        placeholder="e.g. 1800"
        value={values.altitude}
        onChange={set("altitude")}
        error={errors.altitude}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="latitude"
          label="Latitude — Optional"
          type="number"
          min="-90"
          max="90"
          step="0.000001"
          placeholder="e.g. -1.94"
          value={values.latitude}
          onChange={set("latitude")}
          error={errors.latitude}
        />

        <Input
          id="longitude"
          label="Longitude — Optional"
          type="number"
          min="-180"
          max="180"
          step="0.000001"
          placeholder="e.g. 30.06"
          value={values.longitude}
          onChange={set("longitude")}
          error={errors.longitude}
        />
      </div>

      <div className="pt-1">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full justify-center"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <FiLoader size={15} className="animate-spin" />
              Creating farm…
            </span>
          ) : (
            "Create Farm"
          )}
        </Button>
      </div>
    </form>
  );
}
