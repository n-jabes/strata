import { FiCheck } from "react-icons/fi";
import { cn } from "@/lib/utils";

type StepIndicatorProps = {
  currentStep: number;
  steps: string[];
};

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center mb-8">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  isCompleted
                    ? "bg-forest text-white"
                    : isActive
                    ? "bg-forest text-white ring-4 ring-forest/20"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {isCompleted ? <FiCheck size={14} /> : stepNum}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block whitespace-nowrap",
                  isActive ? "text-forest" : "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-3 mb-4 transition-all duration-500",
                  currentStep > stepNum ? "bg-forest" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
