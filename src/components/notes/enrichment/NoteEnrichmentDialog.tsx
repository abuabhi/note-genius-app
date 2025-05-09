import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ListChecks, 
  HelpCircle, 
  Lightbulb, 
  FileSymlink, 
  Pencil, 
  Loader2,
  ArrowUpCircle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  useNoteEnrichment, 
  EnhancementFunction, 
  EnhancementOption 
} from '@/hooks/useNoteEnrichment';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Separator } from '@/components/ui/separator';

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
    
    const result = await enrichNote(noteId, noteContent, selectedEnhancement, noteTitle);
    
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
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="h-5 w-5" />;
      case 'ListChecks': return <ListChecks className="h-5 w-5" />;
      case 'HelpCircle': return <HelpCircle className="h-5 w-5" />;
      case 'Lightbulb': return <Lightbulb className="h-5 w-5" />;
      case 'FileSymlink': return <FileSymlink className="h-5 w-5" />;
      case 'Pencil': return <Pencil className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };
  
  if (!isEnabled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Premium Feature</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <p className="text-center">
              Note enrichment is a premium feature. Please upgrade your account to access this feature.
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button asChild>
              <a href="/pricing">Upgrade Account</a>
            </Button>
          </DialogFooter>
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
        {!enhancedContent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {enhancementOptions.map((option) => (
              <Card 
                key={option.id}
                className={`cursor-pointer hover:border-primary transition-colors ${
                  selectedEnhancement === option.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedEnhancement(option.id)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    {getIconComponent(option.icon)}
                    <CardTitle className="text-base">{option.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription>{option.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">
              Enhancing your note with AI...
            </p>
          </div>
        )}
        
        {/* Results Display */}
        {enhancedContent && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Enhancement generated successfully</span>
            </div>
            
            <Separator />
            
            <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {enhancedContent.split('\n').map((line, index) => (
                  <p key={index}>{line || <br />}</p>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleApplyEnhancement} className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Apply to Note
              </Button>
            </div>
          </div>
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
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Processing...
                </>
              ) : 'Generate Enhancement'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
