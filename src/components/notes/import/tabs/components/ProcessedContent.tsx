
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Info, CheckCircle } from "lucide-react";

interface ProcessedContentProps {
  processedText: string;
  documentTitle: string;
  processingMethod: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const ProcessedContent = ({
  processedText,
  documentTitle,
  processingMethod,
  onTitleChange,
  onSave,
  isSaving
}: ProcessedContentProps) => {
  const isOCRRequired = processingMethod?.includes('failed') && !processingMethod?.includes('ocr');
  const isTextExtractionFailed = processingMethod === 'text-extraction-failed';
  const isOCRSuccess = processingMethod?.includes('ocr-vision-api');
  const isProcessingFailed = processingMethod?.includes('all-processing-failed');

  const getStatusInfo = () => {
    if (isOCRSuccess) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        className: "text-green-700 bg-green-50 border border-green-200",
        title: "OCR Processing Successful",
        message: "Text was successfully extracted using Google Vision API."
      };
    }
    
    if (isProcessingFailed) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        className: "text-red-700 bg-red-50 border border-red-200",
        title: "Processing Failed",
        message: "Both OCR and standard text extraction failed. Please check your API configuration."
      };
    }
    
    if (isTextExtractionFailed) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
        className: "text-amber-700 bg-amber-50 border border-amber-200",
        title: "Standard Text Extraction Failed",
        message: "The document appears to contain images or scanned content. Enable 'Force OCR processing' above to extract text using Google Vision API."
      };
    }
    
    if (processingMethod?.includes('ocr-failed-text-extracted')) {
      return {
        icon: <Info className="h-4 w-4 text-blue-600" />,
        className: "text-blue-700 bg-blue-50 border border-blue-200",
        title: "OCR Failed - Text Extraction Used",
        message: "OCR processing failed, but standard text extraction was successful."
      };
    }
    
    return {
      icon: <Info className="h-4 w-4 text-gray-500" />,
      className: "text-gray-600 bg-gray-100",
      title: `Processing method: ${processingMethod?.replace(/-/g, ' ')}`,
      message: null
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-4">
      {processingMethod && (
        <div className={`text-xs p-3 rounded-lg ${statusInfo.className}`}>
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <span className="font-medium">
              {statusInfo.title}
            </span>
          </div>
          {statusInfo.message && (
            <p className="mt-2 text-sm">
              {statusInfo.message}
            </p>
          )}
        </div>
      )}
      
      <div>
        <Label htmlFor="title">Document Title</Label>
        <Input
          id="title"
          type="text"
          value={documentTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter a title for your note"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label>Content Preview</Label>
        <div className={`border rounded p-4 max-h-60 overflow-y-auto mt-1 ${
          isTextExtractionFailed || isProcessingFailed
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <pre className="whitespace-pre-wrap text-sm">{processedText}</pre>
        </div>
      </div>
      
      <Button
        onClick={onSave}
        disabled={isSaving || !documentTitle}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isSaving ? 'Saving...' : 'Save as Note'}
      </Button>
    </div>
  );
};
