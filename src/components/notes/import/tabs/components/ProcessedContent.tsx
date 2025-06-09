import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Info, CheckCircle, Clock, Zap, ImageIcon, Sparkles } from "lucide-react";

interface ProcessedContentProps {
  processedText: string;
  documentTitle: string;
  documentSubject?: string;
  processingMethod: string;
  onTitleChange: (title: string) => void;
  onSubjectChange?: (subject: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isAiGenerated?: boolean;
  analysisConfidence?: number;
}

export const ProcessedContent = ({
  processedText,
  documentTitle,
  documentSubject,
  processingMethod,
  onTitleChange,
  onSubjectChange,
  onSave,
  isSaving,
  isAiGenerated,
  analysisConfidence
}: ProcessedContentProps) => {
  const getStatusInfo = () => {
    if (processingMethod === 'vision-api-async-success') {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        className: "text-green-700 bg-green-50 border border-green-200",
        title: "PDF Processed Successfully with Google Vision API",
        message: "Text was extracted using Google Cloud Vision API with async workflow for optimal accuracy and quality. Title and subject were automatically generated using AI analysis."
      };
    }
    
    if (processingMethod === 'vision-api-success') {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        className: "text-green-700 bg-green-50 border border-green-200",
        title: "PDF Processed Successfully with Google Vision API",
        message: "Text was extracted using Google Cloud Vision API for optimal accuracy. Title and subject were automatically generated using AI analysis."
      };
    }
    
    if (processingMethod === 'openai-vision-success') {
      return {
        icon: <Zap className="h-4 w-4 text-blue-600" />,
        className: "text-blue-700 bg-blue-50 border border-blue-200",
        title: "PDF Processed Successfully with OpenAI Vision",
        message: "PDF was converted to images and processed using OpenAI Vision API for high-quality OCR. Multi-page documents are supported. Title and subject were automatically generated."
      };
    }
    
    if (processingMethod === 'google-vision-auth-error') {
      return {
        icon: <AlertCircle className="h-4 w-4 text-orange-600" />,
        className: "text-orange-700 bg-orange-50 border border-orange-200",
        title: "Google Cloud Authentication Error",
        message: "Google Cloud Vision API credentials are invalid or expired. Check your service account JSON and ensure it has the correct permissions."
      };
    }
    
    if (processingMethod === 'pdf-conversion-failed') {
      return {
        icon: <ImageIcon className="h-4 w-4 text-red-600" />,
        className: "text-red-700 bg-red-50 border border-red-200",
        title: "PDF Conversion Failed",
        message: "Could not convert PDF to images for processing. The PDF may be corrupted, password-protected, or in an unsupported format."
      };
    }
    
    if (processingMethod === 'openai-vision-processing') {
      return {
        icon: <Clock className="h-4 w-4 text-blue-600" />,
        className: "text-blue-700 bg-blue-50 border border-blue-200",
        title: "Processing with OpenAI Vision...",
        message: "Converting PDF to images and processing with AI-powered OCR. This may take a moment for multi-page documents."
      };
    }
    
    if (processingMethod === 'config-missing') {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        className: "text-red-700 bg-red-50 border border-red-200",
        title: "API Configuration Required",
        message: "Google Cloud Vision API or OpenAI Vision API credentials are required to process PDFs. Configure your API keys in Supabase secrets."
      };
    }
    
    if (processingMethod === 'all-processing-failed') {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        className: "text-red-700 bg-red-50 border border-red-200",
        title: "Processing Failed",
        message: "Both Google Vision API and OpenAI Vision API failed to process this PDF. The file may be corrupted, password-protected, or contain only non-text content."
      };
    }
    
    if (processingMethod === 'docx') {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        className: "text-green-700 bg-green-50 border border-green-200",
        title: "Word Document Processed",
        message: "Document was processed successfully using native Word document parsing. Title and subject were automatically generated using AI analysis."
      };
    }
    
    if (processingMethod === 'processing') {
      return {
        icon: <Clock className="h-4 w-4 text-blue-600" />,
        className: "text-blue-700 bg-blue-50 border border-blue-200",
        title: "Processing Document...",
        message: "AI-powered OCR is analyzing your document. This may take a few moments for optimal results."
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
  const isError = processingMethod === 'all-processing-failed' || 
                  processingMethod === 'config-missing' ||
                  processingMethod === 'pdf-conversion-failed' ||
                  processingMethod === 'google-vision-auth-error';

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

      {isAiGenerated && analysisConfidence && (
        <div className="text-xs p-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-700">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="font-medium">
              AI-Generated Metadata
            </span>
          </div>
          <p className="mt-2 text-sm">
            Title and subject were automatically generated using AI analysis with {Math.round(analysisConfidence * 100)}% confidence. You can edit them if needed.
          </p>
        </div>
      )}
      
      <div>
        <Label htmlFor="title" className="flex items-center gap-2">
          Document Title
          {isAiGenerated && (
            <Sparkles className="h-3 w-3 text-purple-500" />
          )}
        </Label>
        <Input
          id="title"
          type="text"
          value={documentTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter a title for your note"
          className="mt-1"
        />
      </div>

      {onSubjectChange && (
        <div>
          <Label htmlFor="subject" className="flex items-center gap-2">
            Subject
            {isAiGenerated && (
              <Sparkles className="h-3 w-3 text-purple-500" />
            )}
          </Label>
          <Input
            id="subject"
            type="text"
            value={documentSubject || ''}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Document subject"
            className="mt-1"
          />
        </div>
      )}
      
      <div>
        <Label>Content Preview</Label>
        <div className={`border rounded p-4 max-h-60 overflow-y-auto mt-1 ${
          isError ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <pre className="whitespace-pre-wrap text-sm">{processedText}</pre>
        </div>
      </div>
      
      <Button
        onClick={onSave}
        disabled={isSaving || !documentTitle || processingMethod === 'processing' || processingMethod === 'openai-vision-processing'}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isSaving ? 'Saving...' : 'Save as Note'}
      </Button>
    </div>
  );
};
