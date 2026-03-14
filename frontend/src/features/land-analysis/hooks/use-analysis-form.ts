"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FarmerInfo, LandData, AnalysisInput } from "../types";
import { generateRecommendation } from "../logic/generate-recommendation";
import { ANALYSIS_STORAGE_KEY, type StoredAnalysis } from "../types";

type FormErrors = Partial<Record<string, string>>;

export type UseAnalysisFormReturn = {
  step: number;
  direction: number;
  farmerInfo: Partial<FarmerInfo>;
  landData: Partial<LandData>;
  errors: FormErrors;
  isSubmitting: boolean;
  updateFarmerInfo: (fields: Partial<FarmerInfo>) => void;
  updateLandData: (fields: Partial<LandData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (n: number) => void;
  submitAnalysis: () => void;
};

function validateStep1(data: Partial<FarmerInfo>): FormErrors {
  const errors: FormErrors = {};
  if (!data.name?.trim()) errors.name = "Farmer name is required";
  if (!data.location?.trim()) errors.location = "Location is required";
  if (!data.farmSize || isNaN(data.farmSize) || data.farmSize <= 0)
    errors.farmSize = "Farm size must be a positive number";
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

export function useAnalysisForm(): UseAnalysisFormReturn {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [farmerInfo, setFarmerInfo] = useState<Partial<FarmerInfo>>({});
  const [landData, setLandData] = useState<Partial<LandData>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFarmerInfo = (fields: Partial<FarmerInfo>) => {
    setFarmerInfo((prev) => ({ ...prev, ...fields }));
    setErrors({});
  };

  const updateLandData = (fields: Partial<LandData>) => {
    setLandData((prev) => ({ ...prev, ...fields }));
    setErrors({});
  };

  const nextStep = () => {
    if (step === 1) {
      const errs = validateStep1(farmerInfo);
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
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (n: number) => {
    setErrors({});
    setDirection(n > step ? 1 : -1);
    setStep(n);
  };

  const submitAnalysis = () => {
    setIsSubmitting(true);
    const input = { ...farmerInfo, ...landData } as AnalysisInput;
    const result = generateRecommendation(input);
    const stored: StoredAnalysis = {
      input,
      result,
      generatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(stored));

    // Small artificial delay so the loading state is visible
    setTimeout(() => router.push("/analysis-result"), 600);
  };

  return {
    step,
    direction,
    farmerInfo,
    landData,
    errors,
    isSubmitting,
    updateFarmerInfo,
    updateLandData,
    nextStep,
    prevStep,
    goToStep,
    submitAnalysis,
  };
}
