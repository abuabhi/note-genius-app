
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Info, CheckCircle, Clock } from "lucide-react";

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
  const getStatusInfo = () => {
    if (processingMethod === 'vision-api-async-success') {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        className: "text-green-700 bg-green-50 border border-green-200",
        title: "PDF Processed Successfully with Vision API",
        message: "Text was extracted using Google Cloud Vision API with async workflow for optimal accuracy and quality."
      };
    }
    
    if (processingMethod === 'vision-api-success') {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        className: "text-green-700 bg-green-50 border border-green-200",
        title: "PDF Processed Successfully with Vision API",
        message: "Text was extracted using Google Cloud Vision API for optimal accuracy."
      };
    }
    
    if (processingMethod === 'config-missing') {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        className: "text-red-700 bg-red-50 border border-red-200",
        title: "Configuration Required",
        message: "Google Cloud Vision API key and Storage bucket are not configured. Please add them to your Supabase secrets."
      };
    }
    
    if (processingMethod === 'api-key-missing') {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        className: "text-red-700 bg-red-50 border border-red-200",
        title: "API Key Required",
        message: "Google Cloud Vision API key is not configured. Please add it to your Supabase secrets."
      };
    }
    
    if (processingMethod === 'all-processing-failed') {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        className: "text-red-700 bg-red-50 border border-red-200",
        title: "Processing Failed",
        message: "Both Vision API and standard text extraction failed. The PDF may contain only images or require OCR processing."
      };
    }
    
    if (processingMethod === 'standard-text-extraction') {
      return {
        icon: <Info className="h-4 w-4 text-blue-600" />,
        className: "text-blue-700 bg-blue-50 border border-blue-200",
        title: "Standard Text Extraction Used",
        message: "Vision API was not available, but standard text extraction was successful for this PDF."
      };
    }
    
    if (processingMethod === 'docx') {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        className: "text-green-700 bg-green-50 border border-green-200",
        title: "Word Document Processed",
        message: "Document was processed successfully using native Word document parsing."
      };
    }
    
    if (processingMethod === 'processing') {
      return {
        icon: <Clock className="h-4 w-4 text-blue-600" />,
        className: "text-blue-700 bg-blue-50 border border-blue-200",
        title: "Processing Document...",
        message: "Google Cloud Vision API is analyzing your document. This may take a few moments for optimal results."
      };
    }
    
    return {
      icon: <Info className="h-4 w-4 text-gray-500" />,
      className: "text-gray-600 bg-gray-50 border border-gray-200",
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
          processingMethod === 'all-processing-failed' || processingMethod === 'config-missing' || processingMethod === 'api-key-missing'
            ? 'bg-red-50 border-red-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <pre className="whitespace-pre-wrap text-sm">{processedText}</pre>
        </div>
      </div>
      
      <Button
        onClick={onSave}
        disabled={isSaving || !documentTitle || processingMethod === 'processing'}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isSaving ? 'Saving...' : 'Save as Note'}
      </Button>
    </div>
  );
};
