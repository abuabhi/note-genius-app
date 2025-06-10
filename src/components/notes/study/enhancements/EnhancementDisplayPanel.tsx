
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

  // Check if enriched content is in generating/pending state
  const isEnrichedGenerating = contentType === 'enriched' && 
    (note.enriched_status === 'generating' || note.enriched_status === 'pending');
  
  // Handle cancelling stuck generation
  const handleCancelGeneration = async () => {
    if (contentType !== 'summary' && contentType !== 'enriched') return;
    
    setIsCancelling(true);
    
    try {
      const updateData: any = {};
      
      if (contentType === 'summary') {
        updateData.summary_status = 'completed';
        updateData.summary = '';
      } else if (contentType === 'enriched') {
        updateData.enriched_status = 'completed';
        updateData.enriched_content = '';
      }

      const { error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', note.id);

      if (error) {
        console.error("❌ Failed to cancel generation:", error);
        toast.error("Failed to cancel generation");
      } else {
        console.log("✅ Cancelled generation");
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

  // SIMPLIFIED: Direct mapping for enhancement types
  const getEnhancementTypeForRetry = (contentType: EnhancementContentType): string => {
    const mappings = {
      'summary': 'summarize',
      'keyPoints': 'extract-key-points', 
      'improved': 'improve-clarity',
      'markdown': 'convert-to-markdown',
      'enriched': 'enrich-note',
      'original': 'original'
    };
    
    return mappings[contentType] || 'summarize';
  };

  const getContentForType = (type: EnhancementContentType): string => {
    let content = '';
    
    switch (type) {
      case 'summary': 
        content = note.summary || '';
        break;
      case 'keyPoints': 
        content = note.key_points || '';
        break;
      case 'improved': 
        content = note.improved_content || '';
        break;
      case 'markdown': 
        content = note.markdown_content || '';
        break;
      case 'enriched': 
        content = note.enriched_content || '';
        break;
      case 'original': 
        content = note.content || note.description || '';
        break;
      default: 
        content = '';
    }
    
    console.log(`🎯 EnhancementDisplayPanel - Getting content for ${type}:`, {
      contentType: type,
      hasContent: !!content,
      contentLength: content.length,
      contentPreview: content.substring(0, 100)
    });
    
    return content;
  };

  const getTitleForType = (type: EnhancementContentType): string => {
    const titles = {
      'summary': 'Summary',
      'keyPoints': 'Key Points',
      'improved': 'Improved Clarity',
      'markdown': 'Markdown',
      'enriched': 'Enriched Note',
      'original': 'Original Content'
    };
    
    return titles[type] || 'Content';
  };

  const enhancementType = getEnhancementTypeForRetry(contentType);
  const content = getContentForType(contentType);
  const title = getTitleForType(contentType);

  console.log("🎯 EnhancementDisplayPanel - FINAL RENDER:", {
    contentType,
    enhancementType,
    hasContent: !!content,
    contentLength: content.length,
    isLoading,
    isSummaryGenerating,
    isEnrichedGenerating,
    title,
    contentPreview: content.substring(0, 100)
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Show loading state when processing */}
      {(isLoading || isSummaryGenerating || isEnrichedGenerating) && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <LoadingAnimations enhancementType={enhancementType} />
          
          {/* Cancel button for stuck processing */}
          {(isSummaryGenerating || isEnrichedGenerating) && (
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
      
      {/* Show content when not loading - ALL CONTENT GOES THROUGH UNIFIED PROCESSING */}
      {!isLoading && !isSummaryGenerating && !isEnrichedGenerating && (
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
