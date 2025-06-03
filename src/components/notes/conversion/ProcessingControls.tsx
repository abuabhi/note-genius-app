
import React from "react";
import { Button } from "@/components/ui/button";
import { FlashcardType, FlashcardTypeSelector } from "./FlashcardTypeSelector";
import { Sparkles, Eye, EyeOff, Wand2 } from "lucide-react";

interface ProcessingControlsProps {
  selectedType: FlashcardType;
  onTypeChange: (type: FlashcardType) => void;
  isProcessing: boolean;
  onProcess: () => void;
  previewCount: number;
  showPreview: boolean;
  onTogglePreview: () => void;
}

export const ProcessingControls = ({
  selectedType,
  onTypeChange,
  isProcessing,
  onProcess,
  previewCount,
  showPreview,
  onTogglePreview
}: ProcessingControlsProps) => {
  return (
    <div className="space-y-6">
      <FlashcardTypeSelector
        selectedType={selectedType}
        onTypeChange={onTypeChange}
      />
      
      <div className="flex items-center gap-3">
        <Button
          onClick={onProcess}
          disabled={isProcessing}
          className="bg-gradient-to-r from-mint-600 to-blue-600 hover:from-mint-700 hover:to-blue-700 text-white"
        >
          {isProcessing ? (
            <Sparkles className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          {isProcessing ? 'Processing...' : 'Generate Flashcards'}
        </Button>
        
        {previewCount > 0 && (
          <Button
            variant="outline"
            onClick={onTogglePreview}
            className="border-mint-200"
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Hide' : 'Show'} Preview ({previewCount})
          </Button>
        )}
      </div>
    </div>
  );
};
