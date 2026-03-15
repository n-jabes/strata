"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiZap } from "react-icons/fi";
import { useAnalysisForm } from "../hooks/use-analysis-form";
import { StepIndicator } from "./step-indicator";
import { StepFarmerInfo } from "./step-farmer-info";
import { StepLandData } from "./step-land-data";
import { StepReview } from "./step-review";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import type { FarmOption } from "@/lib/db/farms";

const STEPS = ["Select Farm", "Land Data", "Review"];

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};

interface AnalysisFormProps {
  farms: FarmOption[];
  initialFarmId?: string;
}

export function AnalysisForm({ farms, initialFarmId }: AnalysisFormProps) {
  const { toast } = useToast();

  const {
    step,
    direction,
    farmSelection,
    landData,
    errors,
    isSubmitting,
    updateFarmSelection,
    updateLandData,
    nextStep,
    prevStep,
    goToStep,
    submitAnalysis,
  } = useAnalysisForm({
    onSuccess: () => toast("Analysis saved successfully!"),
    onError: (msg) => toast(msg, "error"),
    initialFarmId,
  });

  // When a farmId is pre-supplied we skip step 1 — show only 2 steps in the indicator
  const visibleSteps = initialFarmId ? STEPS.slice(1) : STEPS;
  const indicatorStep = initialFarmId ? step - 1 : step;

  const stepContent: Record<number, React.ReactNode> = {
    1: (
      <StepFarmerInfo
        farms={farms}
        data={farmSelection}
        errors={errors}
        onChange={updateFarmSelection}
      />
    ),
    2: (
      <StepLandData
        data={landData}
        errors={errors}
        onChange={updateLandData}
      />
    ),
    3: (
      <StepReview
        farmSelection={farmSelection}
        landData={landData}
        farms={farms}
        onEditStep={goToStep}
      />
    ),
  };

  const minStep = initialFarmId ? 2 : 1;

  return (
    <div className="bg-white rounded-2xl shadow-lg flex flex-col h-full min-h-[70vh] max-h-[85vh] overflow-hidden">
      {/* Animated progress bar */}
      <div className="h-0.5 bg-gray-100 shrink-0">
        <motion.div
          className="h-full bg-gradient-to-r from-forest to-leaf"
          animate={{ width: `${(indicatorStep / visibleSteps.length) * 100}%` }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />
      </div>

      {/* Step indicator — pinned header */}
      <div className="px-6 sm:px-8 pt-6 pb-5 shrink-0">
        <StepIndicator currentStep={indicatorStep} steps={visibleSteps} />
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-6 sm:mx-8 shrink-0" />

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto form-scroll px-6 sm:px-8 py-6">
        <div className="overflow-x-hidden px-px py-px">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation — pinned footer */}
      <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          {step > minStep ? (
            <Button variant="ghost" onClick={prevStep} disabled={isSubmitting}>
              <FiArrowLeft size={16} />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              variant="primary"
              onClick={nextStep}
              disabled={farms.length === 0}
            >
              Continue
              <FiArrowRight size={16} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={submitAnalysis}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generating…
                </span>
              ) : (
                <>
                  <FiZap size={16} />
                  Generate Analysis
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
