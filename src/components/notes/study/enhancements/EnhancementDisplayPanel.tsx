
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

  // ENHANCED: Better enhancement type mapping for consistent markdown rendering
  const getEnhancementTypeForRetry = (contentType: EnhancementContentType): string => {
    const mappings = {
      'summary': 'summarize',
      'keyPoints': 'extract-key-points', 
      'improved': 'improve-clarity',
      'markdown': 'convert-to-markdown',
      'original': 'original'
    };
    
    const enhancementType = mappings[contentType] || 'summarize';
    
    console.log("🎯 Enhancement type mapping:", {
      contentType,
      mappedType: enhancementType
    });
    
    return enhancementType;
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
    const titles = {
      'summary': 'Summary',
      'keyPoints': 'Key Points',
      'improved': 'Improved Content',
      'markdown': 'Markdown',
      'original': 'Original Content'
    };
    
    return titles[type] || 'Content';
  };

  const enhancementType = getEnhancementTypeForRetry(contentType);
  const content = getContentForType(contentType);
  const title = getTitleForType(contentType);

  console.log("🎯 EnhancementDisplayPanel rendering:", {
    contentType,
    enhancementType,
    hasContent: !!content,
    contentLength: content.length,
    isLoading,
    isSummaryGenerating
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Show loading state when processing */}
      {(isLoading || isSummaryGenerating) && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <LoadingAnimations enhancementType={enhancementType} />
          
          {/* Cancel button for stuck processing */}
          {isSummaryGenerating && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelGeneration}
                disabled={isCancelling}
                className="text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <X className="h-4 w-4 mr-2" />
                {isCancelling ? "Cancelling..." : "Cancel Generation"}
              </Button>
              
              {onRetryEnhancement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetryEnhancement(enhancementType)}
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
            content={content}
            title={title}
            fontSize={fontSize}
            textAlign={textAlign}
            enhancementType={enhancementType}
            onRetry={onRetryEnhancement}
          />
        </div>
      )}
    </div>
  );
};
