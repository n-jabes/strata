import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { LandData, SoilType, RainfallLevel } from "../types";

const SOIL_OPTIONS = [
  { value: "clay", label: "Clay" },
  { value: "loam", label: "Loam" },
  { value: "sandy", label: "Sandy" },
  { value: "volcanic", label: "Volcanic" },
];

const RAINFALL_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
];

type StepLandDataProps = {
  data: Partial<LandData>;
  errors: Partial<Record<string, string>>;
  onChange: (fields: Partial<LandData>) => void;
};

export function StepLandData({ data, errors, onChange }: StepLandDataProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Land Characteristics
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Describe the terrain and soil conditions of your land.
        </p>
      </div>

      <Input
        id="slopeAngle"
        label="Slope Angle (degrees)"
        type="number"
        min="0"
        max="90"
        placeholder="e.g. 25"
        value={data.slopeAngle !== undefined ? String(data.slopeAngle) : ""}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange({ slopeAngle: isNaN(val) ? undefined : val });
        }}
        error={errors.slopeAngle}
      />

      <Select
        id="soilType"
        label="Soil Type"
        options={SOIL_OPTIONS}
        value={data.soilType ?? ""}
        onChange={(val) => onChange({ soilType: val as SoilType })}
        placeholder="Select soil type"
        error={errors.soilType}
      />

      <Select
        id="rainfallLevel"
        label="Rainfall Level"
        options={RAINFALL_OPTIONS}
        value={data.rainfallLevel ?? ""}
        onChange={(val) => onChange({ rainfallLevel: val as RainfallLevel })}
        placeholder="Select rainfall level"
        error={errors.rainfallLevel}
      />

      <Input
        id="altitude"
        label="Altitude (meters) — Optional"
        type="number"
        min="0"
        placeholder="e.g. 1800"
        value={data.altitude !== undefined ? String(data.altitude) : ""}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange({ altitude: isNaN(val) ? undefined : val });
        }}
      />
    </div>
  );
}
