
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Info } from "lucide-react";

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
  const isOCRRequired = processingMethod?.includes('failed') || processingMethod?.includes('ocr');
  const isTextExtractionFailed = processingMethod === 'text-extraction-failed';

  return (
    <div className="space-y-4">
      {processingMethod && (
        <div className={`text-xs p-3 rounded-lg ${
          isOCRRequired 
            ? 'text-amber-700 bg-amber-50 border border-amber-200' 
            : 'text-gray-600 bg-gray-100'
        }`}>
          <div className="flex items-center gap-2">
            {isOCRRequired ? (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            ) : (
              <Info className="h-4 w-4 text-gray-500" />
            )}
            <span className="font-medium">
              Processing method: {processingMethod.replace(/-/g, ' ')}
            </span>
          </div>
          {isTextExtractionFailed && (
            <p className="mt-2 text-sm">
              The document appears to contain images or scanned content. Enable "Force OCR processing" above to extract text from image-based PDFs.
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
          isTextExtractionFailed 
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
