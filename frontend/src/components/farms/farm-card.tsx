import Link from "next/link";
import {
  FiMapPin,
  FiLayers,
  FiBarChart2,
  FiArrowRight,
  FiMap,
} from "react-icons/fi";
import type { FarmWithCount } from "@/lib/db/farms";

interface FarmCardProps {
  farm: FarmWithCount;
}

export function FarmCard({ farm }: FarmCardProps) {
  const date = farm.createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {farm.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
            <FiMapPin size={11} className="shrink-0" />
            <span className="truncate">{farm.location}</span>
          </div>
          {farm.user ? (
            <p className="mt-1 text-[11px] text-gray-400 truncate">
              Owner: {farm.user.name ?? farm.user.email}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center">
          <FiLayers size={16} className="text-forest" />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-400 mb-0.5">Size</p>
          <p className="text-xs font-semibold text-gray-700">{farm.size} ha</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-400 mb-0.5">Altitude</p>
          <p className="text-xs font-semibold text-gray-700">
            {farm.altitude ? `${farm.altitude} m` : "—"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-400 mb-0.5">Analyses</p>
          <p className="text-xs font-semibold text-gray-700">
            {farm._count.analyses}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-400">{date}</p>
        <div className="flex items-center gap-2">
          <Link
            href={`/analyze-land?farmId=${farm.id}`}
            className="flex items-center gap-1 text-xs font-medium text-leaf hover:text-leaf/80 transition-colors"
            title="Analyze Land"
          >
            <FiMap size={12} />
            Analyze
          </Link>
          <span className="text-gray-200">|</span>
          <Link
            href={`/farms/${farm.id}`}
            className="flex items-center gap-1 text-xs font-medium text-forest hover:text-forest/80 transition-colors"
          >
            View <FiArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Empty state shown when the user has no farms. */
export function FarmCardEmpty() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <FiBarChart2 size={28} className="text-gray-300" />
      </div>
      <h2 className="text-base font-semibold text-gray-900 mb-2">
        No farms yet
      </h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Add your first farm to start organizing land analyses and tracking your
        agricultural data.
      </p>
      <Link
        href="/farms/create"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest/90 transition-colors"
      >
        <FiLayers size={14} />
        Create Your First Farm
      </Link>
    </div>
  );
}
