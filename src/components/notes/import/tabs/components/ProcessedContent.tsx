
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  return (
    <div className="space-y-4">
      {processingMethod && (
        <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
          Processing method: {processingMethod}
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
        <div className="border border-gray-200 rounded p-4 max-h-60 overflow-y-auto bg-gray-50 mt-1">
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
