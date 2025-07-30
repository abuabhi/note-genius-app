import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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
  const [selectedEnhancement, setSelectedEnhancement] = useState<string>('summary');
  const [enhancedContent, setEnhancedContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnhancement = async () => {
    if (!noteContent) {
      toast.error("Content required", {
        description: "Please add content to enhance"
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-enhance', {
        body: { text: noteContent, enhancementType: selectedEnhancement }
      });

      if (error) throw error;
      
      if (data.success) {
        setEnhancedContent(JSON.stringify(data.result, null, 2));
        toast.success('Enhancement completed successfully!');
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error("Failed to enhance note");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyEnhancement = () => {
    onApplyEnhancement(enhancedContent);
    onOpenChange(false);
    setEnhancedContent('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setEnhancedContent('');
  };
  const enhancementOptions = [
    { id: 'summary', label: 'Generate Summary', description: 'Create a concise summary of your note' },
    { id: 'extract-key-points', label: 'Extract Key Points', description: 'Identify the most important concepts' },
    { id: 'generate-questions', label: 'Generate Questions', description: 'Create study questions from your content' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enhance Your Note</DialogTitle>
          <DialogDescription>
            Choose an enhancement type to improve your note with AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!enhancedContent && !isProcessing && (
            <div className="space-y-4">
              <h3 className="font-medium">Select Enhancement Type</h3>
              <div className="grid gap-3">
                {enhancementOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedEnhancement === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedEnhancement(option.id)}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-muted-foreground">Processing...</p>
              </div>
            </div>
          )}

          {enhancedContent && (
            <div className="space-y-4">
              <h3 className="font-medium">Enhanced Content</h3>
              <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{enhancedContent}</pre>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {!enhancedContent && !isProcessing && (
            <Button onClick={handleEnhancement} disabled={isProcessing}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Enhancement
            </Button>
          )}
          {enhancedContent && (
            <Button onClick={handleApplyEnhancement}>
              Apply to Note
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
