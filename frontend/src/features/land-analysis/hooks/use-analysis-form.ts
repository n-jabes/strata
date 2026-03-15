"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FarmSelection, LandData, AnalysisInput } from "../types";
import { saveAnalysis } from "../actions/save-analysis";

type FormErrors = Partial<Record<string, string>>;

type AnalysisFormOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  initialFarmId?: string;
};

export type UseAnalysisFormReturn = {
  step: number;
  direction: number;
  farmSelection: Partial<FarmSelection>;
  landData: Partial<LandData>;
  errors: FormErrors;
  isSubmitting: boolean;
  updateFarmSelection: (fields: Partial<FarmSelection>) => void;
  updateLandData: (fields: Partial<LandData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (n: number) => void;
  submitAnalysis: () => void;
};

function validateStep1(data: Partial<FarmSelection>): FormErrors {
  const errors: FormErrors = {};
  if (!data.farmId) errors.farmId = "Please select a farm to continue.";
  return errors;
}

function validateStep2(data: Partial<LandData>): FormErrors {
  const errors: FormErrors = {};
  if (data.slopeAngle === undefined || isNaN(data.slopeAngle)) {
    errors.slopeAngle = "Slope angle is required";
  } else if (data.slopeAngle < 0 || data.slopeAngle > 90) {
    errors.slopeAngle = "Slope angle must be between 0° and 90°";
  }
  if (!data.soilType) errors.soilType = "Soil type is required";
  if (!data.rainfallLevel) errors.rainfallLevel = "Rainfall level is required";
  return errors;
}

export function useAnalysisForm(
  options?: AnalysisFormOptions
): UseAnalysisFormReturn {
  const router = useRouter();

  // If a farmId was pre-supplied (via URL query param), skip step 1
  const initialStep = options?.initialFarmId ? 2 : 1;

  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const [farmSelection, setFarmSelection] = useState<Partial<FarmSelection>>(
    options?.initialFarmId ? { farmId: options.initialFarmId } : {}
  );
  const [landData, setLandData] = useState<Partial<LandData>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFarmSelection = (fields: Partial<FarmSelection>) => {
    setFarmSelection((prev) => ({ ...prev, ...fields }));
    setErrors({});
  };

  const updateLandData = (fields: Partial<LandData>) => {
    setLandData((prev) => ({ ...prev, ...fields }));
    setErrors({});
  };

  const nextStep = () => {
    if (step === 1) {
      const errs = validateStep1(farmSelection);
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    }
    if (step === 2) {
      const errs = validateStep2(landData);
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    }
    setErrors({});
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setErrors({});
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, options?.initialFarmId ? 2 : 1));
  };

  const goToStep = (n: number) => {
    setErrors({});
    setDirection(n > step ? 1 : -1);
    setStep(n);
  };

  const submitAnalysis = () => {
    void (async () => {
      setIsSubmitting(true);
      try {
        const input = { ...farmSelection, ...landData } as AnalysisInput;
        const { analysisId } = await saveAnalysis(input);
        options?.onSuccess?.();
        router.push(`/analysis-result/${analysisId}`);
      } catch {
        setIsSubmitting(false);
        options?.onError?.(
          "Unable to save analysis. Please check your connection and try again."
        );
      }
    })();
  };

  return {
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
  };
}
