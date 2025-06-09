
import React from "react";

interface ProcessingOptionsProps {
  fileType: string;
  forceOCR: boolean;
  onForceOCRChange: (checked: boolean) => void;
}

export const ProcessingOptions = ({ fileType, forceOCR, onForceOCRChange }: ProcessingOptionsProps) => {
  // Processing options are no longer needed as we use AI-powered OCR by default
  return null;
};
