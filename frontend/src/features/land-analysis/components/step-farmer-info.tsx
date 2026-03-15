import Link from "next/link";
import { FiPlus, FiMapPin } from "react-icons/fi";
import { cn } from "@/lib/utils";
import type { FarmOption } from "@/lib/db/farms";
import type { FarmSelection } from "../types";

type StepFarmSelectProps = {
  farms: FarmOption[];
  data: Partial<FarmSelection>;
  errors: Partial<Record<string, string>>;
  onChange: (fields: Partial<FarmSelection>) => void;
};

export function StepFarmerInfo({
  farms,
  data,
  errors,
  onChange,
}: StepFarmSelectProps) {
  if (farms.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Select Farm</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose the farm you want to analyze.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center gap-3">
          <FiMapPin size={28} className="text-gray-300" />
          <p className="text-sm font-medium text-gray-600">
            You have no farms yet.
          </p>
          <p className="text-xs text-gray-400">
            Create a farm first, then come back to run an analysis.
          </p>
          <Link
            href="/farms/create"
            className="mt-1 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest/90 transition-colors"
          >
            <FiPlus size={14} />
            Create Your First Farm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Select Farm</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose the farm to associate with this land analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {farms.map((farm) => {
          const selected = data.farmId === farm.id;
          return (
            <button
              key={farm.id}
              type="button"
              onClick={() => onChange({ farmId: farm.id })}
              className={cn(
                "w-full text-left rounded-xl border-2 p-4 transition-all duration-150",
                selected
                  ? "border-forest bg-forest/5 shadow-sm"
                  : "border-gray-100 hover:border-forest/30 hover:bg-gray-50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold truncate",
                      selected ? "text-forest" : "text-gray-900"
                    )}
                  >
                    {farm.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {farm.location}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium text-gray-700">
                    {farm.size} ha
                  </p>
                  {farm.altitude && (
                    <p className="text-xs text-gray-400">{farm.altitude} m</p>
                  )}
                </div>
              </div>
              {selected && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-forest" />
                  <span className="text-xs font-medium text-forest">
                    Selected
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {errors.farmId && (
        <p className="text-xs text-red-500">{errors.farmId}</p>
      )}

      <Link
        href="/farms/create"
        className="flex items-center gap-2 text-xs font-medium text-forest hover:text-forest/80 transition-colors"
      >
        <FiPlus size={12} />
        Add a new farm
      </Link>
    </div>
  );
}
