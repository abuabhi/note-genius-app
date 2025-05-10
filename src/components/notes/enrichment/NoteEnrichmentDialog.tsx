
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
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import { PremiumFeatureNotice } from './PremiumFeatureNotice';
import { EnhancementSelection } from './EnhancementSelection';
import { EnhancementProcessing } from './EnhancementProcessing';
import { EnhancementResults } from './EnhancementResults';

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
  
  const { toast } = useToast();
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFunction | null>(null);
  
  useEffect(() => {
    if (open) {
      initialize();
    }
  }, [open, initialize]);
  
  const handleEnhancement = async () => {
    if (!selectedEnhancement) {
      toast({
        title: "Enhancement required",
        description: "Please select an enhancement type",
        variant: "destructive"
      });
      return;
    }
    
    const result = await enrichNote(
      noteId, 
      noteContent, 
      selectedEnhancement,
      noteTitle
    );
    
    if (!result) {
      return; // Error already handled in the hook
    }
  };
  
  const handleApplyEnhancement = () => {
    if (enhancedContent) {
      onApplyEnhancement(enhancedContent);
      toast({
        title: "Enhancement applied",
        description: "Your note has been updated with the enhanced content"
      });
      onOpenChange(false);
    }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        {/* Enhancement Selection */}
        {!enhancedContent && !isLoading && (
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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {!enhancedContent && !isLoading && (
            <Button 
              onClick={handleEnhancement}
              disabled={!selectedEnhancement || isLoading}
            >
              Generate Enhancement
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
