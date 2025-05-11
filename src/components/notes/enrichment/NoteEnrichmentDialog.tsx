
import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useNoteEnrichment } from '@/hooks/useNoteEnrichment';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { PremiumFeatureNotice } from './PremiumFeatureNotice';
import { EnhancementSelection } from './EnhancementSelection';
import { EnhancementProcessing } from './EnhancementProcessing';
import { EnhancementResults } from './EnhancementResults';
import { EnhancementError } from './EnhancementError';
import { UsageIndicator } from './UsageIndicator';
import { Note } from '@/types/note';
import { EnhancementFunction } from '@/hooks/noteEnrichment/types';

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
  // Create a mock note object to pass to useNoteEnrichment
  const mockNote: Note = {
    id: noteId,
    title: noteTitle,
    content: noteContent,
    description: "",
    date: new Date().toISOString().split('T')[0],
    category: "General",
    sourceType: "manual" // Explicitly set as "manual" with the correct type
  };
  
  const { 
    isProcessing,
    enhancedContent, 
    error,
    selectedEnhancement,
    setSelectedEnhancement,
    enhancementOptions,
    processEnhancement,
    isLoading,
    currentUsage,
    monthlyLimit,
    isEnabled,
    initialize,
    setEnhancedContent
  } = useNoteEnrichment(mockNote);
  
  useEffect(() => {
    if (open) {
      setSelectedEnhancement(null);
      setEnhancedContent('');
      initialize();
    }
  }, [open, initialize, setSelectedEnhancement, setEnhancedContent]);
  
  const handleEnhancement = async () => {
    if (!selectedEnhancement) {
      toast("Enhancement required", {
        description: "Please select an enhancement type"
      });
      return;
    }
    
    if (!noteContent || noteContent.trim().length < 50) {
      toast("Content too short", {
        description: "Please add more content to enhance"
      });
      return;
    }
    
    console.log("Starting enhancement with type:", selectedEnhancement);
    await processEnhancement(selectedEnhancement);
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
    if (selectedEnhancement) {
      processEnhancement(selectedEnhancement);
    }
  };
  
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSelectEnhancement = (id: EnhancementFunction) => {
    console.log("NoteEnrichmentDialog - Setting selected enhancement to:", id);
    setSelectedEnhancement(id);
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
          <DialogDescription>
            Select an enhancement option below to improve your note content.
          </DialogDescription>
        </DialogHeader>
        
        <UsageIndicator currentUsage={currentUsage} monthlyLimit={monthlyLimit} />

        {/* Error Display */}
        {error && (
          <EnhancementError error={error} onRetry={handleRetry} />
        )}

        {/* Enhancement Selection */}
        {!enhancedContent && !isLoading && !error && (
          <EnhancementSelection 
            options={enhancementOptions}
            selectedEnhancement={selectedEnhancement}
            onSelect={handleSelectEnhancement}
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
              disabled={selectedEnhancement === null || isLoading}
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
