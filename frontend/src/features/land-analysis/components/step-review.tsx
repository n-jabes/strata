import { FiEdit2 } from "react-icons/fi";
import type { FarmerInfo, LandData } from "../types";

type ReviewRowProps = { label: string; value: string };

function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 capitalize">{value}</span>
    </div>
  );
}

type ReviewSectionProps = {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
};

function ReviewSection({ title, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs font-medium text-forest hover:text-forest-dark transition-colors cursor-pointer group"
        >
          <FiEdit2 size={12} className="transition-transform group-hover:rotate-12" />
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

type StepReviewProps = {
  farmerInfo: Partial<FarmerInfo>;
  landData: Partial<LandData>;
  onEditStep: (step: number) => void;
};

export function StepReview({ farmerInfo, landData, onEditStep }: StepReviewProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Review Your Information
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Confirm your details before generating the analysis.
        </p>
      </div>

      <ReviewSection title="Farmer Information" onEdit={() => onEditStep(1)}>
        <ReviewRow label="Name" value={farmerInfo.name ?? "—"} />
        <ReviewRow label="Location" value={farmerInfo.location ?? "—"} />
        <ReviewRow
          label="Farm Size"
          value={farmerInfo.farmSize ? `${farmerInfo.farmSize} ha` : "—"}
        />
      </ReviewSection>

      <ReviewSection title="Land Characteristics" onEdit={() => onEditStep(2)}>
        <ReviewRow
          label="Slope Angle"
          value={
            landData.slopeAngle !== undefined
              ? `${landData.slopeAngle}°`
              : "—"
          }
        />
        <ReviewRow label="Soil Type" value={landData.soilType ?? "—"} />
        <ReviewRow
          label="Rainfall Level"
          value={landData.rainfallLevel ?? "—"}
        />
        {landData.altitude !== undefined && (
          <ReviewRow label="Altitude" value={`${landData.altitude} m`} />
        )}
      </ReviewSection>
    </div>
  );
}
