
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useNoteEnrichment, EnhancementFunction } from '@/hooks/useNoteEnrichment';
import { toast } from '@/components/ui/sonner';
import { Progress } from "@/components/ui/progress";
import { PremiumFeatureNotice } from './PremiumFeatureNotice';
import { EnhancementSelection } from './EnhancementSelection';
import { EnhancementProcessing } from './EnhancementProcessing';
import { EnhancementResults } from './EnhancementResults';
import { AlertCircle } from 'lucide-react';

interface NoteEnrichmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
  noteTitle: string;
  noteContent: string;
  onApplyEnhancement: (enhancedContent: string) => void;
}

export const NoteEnrichmentDialog: React.FC<NoteEnrichmentDialogProps> = ({
  open,
  onOpenChange,
  noteId,
  noteTitle,
  noteContent,
  onApplyEnhancement
}) => {
  const { 
    enrichNote, 
    isLoading, 
    enhancedContent, 
    currentUsage, 
    monthlyLimit,
    isEnabled,
    initialize,
    enhancementOptions
  } = useNoteEnrichment();
  
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFunction | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (open) {
      setError(null);
      initialize();
    }
  }, [open, initialize]);
  
  const handleEnhancement = async () => {
    if (!selectedEnhancement) {
      toast("Enhancement required", {
        description: "Please select an enhancement type",
      });
      return;
    }
    
    setError(null);
    
    const result = await enrichNote(
      noteId, 
      noteContent, 
      selectedEnhancement,
      noteTitle
    );
    
    if (!result) {
      setError("Failed to enhance note. Please try again.");
    }
  };
  
  const handleApplyEnhancement = () => {
    if (enhancedContent) {
      onApplyEnhancement(enhancedContent);
      toast("Enhancement applied", {
        description: "Your note has been updated with the enhanced content"
      });
      onOpenChange(false);
    }
  };
  
  const handleRetry = () => {
    setError(null);
    handleEnhancement();
  };
  
  const handleClose = () => {
    setError(null);
    setSelectedEnhancement(null);
    onOpenChange(false);
  };
  
  // If feature is not enabled, show premium notice
  if (!isEnabled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <PremiumFeatureNotice onClose={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enhance Your Note</DialogTitle>
        </DialogHeader>
        
        {/* Usage Indicator */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Monthly Usage</span>
            <span>{currentUsage} / {monthlyLimit || '∞'}</span>
          </div>
          {monthlyLimit && (
            <Progress value={(currentUsage / monthlyLimit) * 100} />
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-md flex items-start gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Enhancement failed</p>
              <p className="text-red-600 text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleRetry}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Enhancement Selection */}
        {!enhancedContent && !isLoading && !error && (
          <EnhancementSelection 
            options={enhancementOptions}
            selectedEnhancement={selectedEnhancement}
            onSelect={(id) => setSelectedEnhancement(id as EnhancementFunction)}
          />
        )}
        
        {/* Loading State */}
        {isLoading && <EnhancementProcessing />}
        
        {/* Results Display */}
        {enhancedContent && !isLoading && (
          <EnhancementResults 
            enhancedContent={enhancedContent} 
            onApply={handleApplyEnhancement} 
          />
        )}
        
        <DialogFooter className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="border-mint-200 hover:bg-mint-50 hover:text-mint-700"
          >
            Cancel
          </Button>
          {!enhancedContent && !isLoading && !error && (
            <Button 
              onClick={handleEnhancement}
              disabled={!selectedEnhancement || isLoading}
              className="bg-mint-500 hover:bg-mint-600 text-white"
            >
              Generate Enhancement
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
