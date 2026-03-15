import Link from "next/link";
import { FiMap } from "react-icons/fi";
import { cn } from "@/lib/utils";
import type { ErosionRisk } from "@/features/land-analysis/types";

const EROSION_BADGE: Record<ErosionRisk, string> = {
  Low: "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

type AnalysisRow = {
  id: string;
  slope: number;
  soilType: string;
  rainfall: string;
  createdAt: Date;
  recommendation: {
    terraceType: string;
    erosionRisk: string;
    recommendedCrops: string[];
  } | null;
};

interface FarmAnalysisTableProps {
  analyses: AnalysisRow[];
  farmId: string;
}

export function FarmAnalysisTable({
  analyses,
  farmId,
}: FarmAnalysisTableProps) {
  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FiMap size={28} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-600">
          No analyses yet for this farm.
        </p>
        <p className="text-xs text-gray-400 mt-1 mb-5">
          Run your first land analysis to see results here.
        </p>
        <Link
          href={`/analyze-land?farmId=${farmId}`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-forest rounded-lg hover:bg-forest/90 transition-colors"
        >
          Analyze Land
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Date
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Slope
            </th>
            <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Soil Type
            </th>
            <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Rainfall
            </th>
            <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Top Crop
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Risk
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {analyses.map((a) => {
            const risk = a.recommendation?.erosionRisk as ErosionRisk | undefined;
            const topCrop = a.recommendation?.recommendedCrops[0];
            const date = a.createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            return (
              <tr
                key={a.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
              >
                <td className="px-4 sm:px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {date}
                </td>
                <td className="px-4 py-3 text-gray-700 font-medium">
                  {a.slope}°
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-gray-500 capitalize">
                  {a.soilType}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-gray-500 capitalize">
                  {a.rainfall}
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-gray-500">
                  {topCrop ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {risk && (
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold",
                        EROSION_BADGE[risk]
                      )}
                    >
                      {risk}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/analysis-result/${a.id}`}
                    className="text-xs font-medium text-forest hover:text-forest/80 transition-colors whitespace-nowrap"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
