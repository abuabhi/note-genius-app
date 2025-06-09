
import React from "react";
import { Label } from "@/components/ui/label";

interface ProcessingOptionsProps {
  fileType: string;
  forceOCR: boolean;
  onForceOCRChange: (checked: boolean) => void;
}

export const ProcessingOptions = ({ fileType, forceOCR, onForceOCRChange }: ProcessingOptionsProps) => {
  if (fileType !== 'application/pdf') {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
      <input
        type="checkbox"
        id="force-ocr"
        checked={forceOCR}
        onChange={(e) => onForceOCRChange(e.target.checked)}
        className="rounded"
      />
      <Label htmlFor="force-ocr" className="text-sm">
        Force OCR processing (for handwritten or scanned PDFs)
      </Label>
    </div>
  );
};
