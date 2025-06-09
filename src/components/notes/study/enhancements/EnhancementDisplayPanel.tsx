
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementContentType } from "./EnhancementSelector";
import { EnhancementContent } from "./EnhancementContent";
import { LoadingAnimations } from "./LoadingAnimations";
import { RefreshCw, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnhancementDisplayPanelProps {
  note: Note;
  contentType: EnhancementContentType;
  fontSize: number;
  textAlign: TextAlignType;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => Promise<void>;
  onCancelEnhancement?: () => void;
  className?: string;
}

export const EnhancementDisplayPanel = ({
  note,
  contentType,
  fontSize,
  textAlign,
  isLoading = false,
  onRetryEnhancement,
  onCancelEnhancement,
  className = ""
}: EnhancementDisplayPanelProps) => {
  const [isCancelling, setIsCancelling] = useState(false);

  // Check if summary is in generating/pending state
  const isSummaryGenerating = contentType === 'summary' && 
    (note.summary_status === 'generating' || note.summary_status === 'pending');
  
  // Handle cancelling stuck generation
  const handleCancelGeneration = async () => {
    if (contentType !== 'summary') return;
    
    setIsCancelling(true);
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ 
          summary_status: 'completed',
          summary: ''
        })
        .eq('id', note.id);

      if (error) {
        console.error("❌ Failed to cancel generation:", error);
        toast.error("Failed to cancel generation");
      } else {
        console.log("✅ Cancelled summary generation");
        toast.success("Generation cancelled");
        
        if (onCancelEnhancement) {
          onCancelEnhancement();
        }
      }
    } catch (error) {
      console.error("❌ Exception cancelling generation:", error);
      toast.error("Failed to cancel generation");
    } finally {
      setIsCancelling(false);
    }
  };

  const getEnhancementTypeForRetry = (contentType: EnhancementContentType): string => {
    switch (contentType) {
      case 'summary': return 'summarize';
      case 'keyPoints': return 'extract-key-points';
      case 'improved': return 'improve-clarity';
      case 'markdown': return 'convert-to-markdown';
      default: return 'summarize';
    }
  };

  const getContentForType = (type: EnhancementContentType): string => {
    switch (type) {
      case 'summary': return note.summary || '';
      case 'keyPoints': return note.key_points || '';
      case 'improved': return note.improved_content || '';
      case 'markdown': return note.markdown_content || '';
      case 'original': return note.content || note.description || '';
      default: return '';
    }
  };

  const getTitleForType = (type: EnhancementContentType): string => {
    switch (type) {
      case 'summary': return 'Summary';
      case 'keyPoints': return 'Key Points';
      case 'improved': return 'Improved Content';
      case 'markdown': return 'Markdown';
      case 'original': return 'Original Content';
      default: return 'Content';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Show loading state when processing */}
      {(isLoading || isSummaryGenerating) && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <LoadingAnimations enhancementType={getEnhancementTypeForRetry(contentType)} />
          
          {/* Cancel button for stuck processing */}
          {isSummaryGenerating && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelGeneration}
                disabled={isCancelling}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                {isCancelling ? "Cancelling..." : "Cancel Generation"}
              </Button>
              
              {onRetryEnhancement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetryEnhancement(getEnhancementTypeForRetry(contentType))}
                  disabled={isCancelling}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Show content when not loading */}
      {!isLoading && !isSummaryGenerating && (
        <div className="flex-1 overflow-auto">
          <EnhancementContent
            content={getContentForType(contentType)}
            title={getTitleForType(contentType)}
            fontSize={fontSize}
            textAlign={textAlign}
            isMarkdown={contentType === 'markdown'}
            enhancementType={getEnhancementTypeForRetry(contentType)}
            onRetry={onRetryEnhancement}
          />
        </div>
      )}
    </div>
  );
};
