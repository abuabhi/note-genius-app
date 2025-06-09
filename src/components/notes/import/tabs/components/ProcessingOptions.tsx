
import React from "react";

interface ProcessingOptionsProps {
  fileType: string;
  forceOCR: boolean;
  onForceOCRChange: (checked: boolean) => void;
}

export const ProcessingOptions = ({ fileType, forceOCR, onForceOCRChange }: ProcessingOptionsProps) => {
  // Hide the processing options since we now use Vision API by default for PDFs
  return null;
};
