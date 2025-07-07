import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, X, Type } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ExpansionPreviewDialogProps {
  isOpen: boolean;
  expansion: {
    originalText: string;
    expandedContent: string;
    contentType: string;
  } | null;
  isRegenerating?: boolean;
  onConfirm: () => void;
  onRegenerate: () => void;
  onCancel: () => void;
}

export const ExpansionPreviewDialog = ({
  isOpen,
  expansion,
  isRegenerating = false,
  onConfirm,
  onRegenerate,
  onCancel
}: ExpansionPreviewDialogProps) => {
  if (!expansion) return null;

  const wordCount = expansion.expandedContent.split(/\s+/).length;

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Content Expansion Preview
          </DialogTitle>
          <DialogDescription>
            Review the AI-generated expansion for your selected text in the <span className="font-medium capitalize">{expansion.contentType}</span> tab.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original Selected Text */}
          <div className="p-3 bg-muted rounded-lg border-l-4 border-l-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Selected Text:</h4>
            <p className="text-sm italic">"{expansion.originalText}"</p>
          </div>

          {/* AI Generated Expansion */}
          <div className="p-4 bg-accent/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                🤖 AI Expansion
              </h4>
              <span className="text-xs text-muted-foreground">
                {wordCount} words
              </span>
            </div>
            <div className="prose prose-sm max-w-none text-foreground">
              <ReactMarkdown>{expansion.expandedContent}</ReactMarkdown>
            </div>
          </div>

          {/* Length Indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${
              wordCount <= 200 ? 'bg-primary' : 'bg-orange-500'
            }`} />
            <span>
              {wordCount <= 200 ? 'Optimal length' : 'Slightly longer than recommended'}
            </span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 sm:flex-initial"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex-1 sm:flex-initial"
            >
              {isRegenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
          <Button
            onClick={onConfirm}
            disabled={isRegenerating}
            className="w-full sm:w-auto"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm & Add to Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};