import { Input } from "@/components/ui/input";
import type { FarmerInfo } from "../types";

type StepFarmerInfoProps = {
  data: Partial<FarmerInfo>;
  errors: Partial<Record<string, string>>;
  onChange: (fields: Partial<FarmerInfo>) => void;
};

export function StepFarmerInfo({ data, errors, onChange }: StepFarmerInfoProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Farmer Information
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Tell us about yourself and your farm.
        </p>
      </div>

      <Input
        id="name"
        label="Farmer Name"
        placeholder="e.g. Jean Baptiste"
        value={data.name ?? ""}
        onChange={(e) => onChange({ name: e.target.value })}
        error={errors.name}
      />

      <Input
        id="location"
        label="Location"
        placeholder="e.g. Musanze, Rwanda"
        value={data.location ?? ""}
        onChange={(e) => onChange({ location: e.target.value })}
        error={errors.location}
      />

      <Input
        id="farmSize"
        label="Farm Size (hectares)"
        type="number"
        min="0"
        step="0.1"
        placeholder="e.g. 2.5"
        value={data.farmSize !== undefined ? String(data.farmSize) : ""}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange({ farmSize: isNaN(val) ? undefined : val });
        }}
        error={errors.farmSize}
      />
    </div>
  );
}
