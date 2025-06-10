
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

/**
 * NUCLEAR FIX: Aggressive content preprocessing to strip HTML/prose classes
 */
const preprocessContentForNuclearRendering = (content: string, contentType: EnhancementContentType): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  console.log(`🧹 NUCLEAR PREPROCESSING - ${contentType} BEFORE:`, {
    contentLength: content.length,
    hasHTML: /<[^>]*>/g.test(content),
    hasProse: /prose/.test(content),
    preview: content.substring(0, 200)
  });

  // NUCLEAR: Aggressive HTML and prose class removal for Original and Improved Clarity
  if (contentType === 'original' || contentType === 'improved') {
    let processed = content
      // Remove ALL HTML tags completely
      .replace(/<[^>]*>/g, '')
      // Remove prose classes and any class attributes
      .replace(/class="[^"]*prose[^"]*"/gi, '')
      .replace(/class='[^']*prose[^']*'/gi, '')
      // Remove TipTap specific markup
      .replace(/data-[^=]*="[^"]*"/gi, '')
      // Remove inline styles
      .replace(/style="[^"]*"/gi, '')
      // Clean up HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    console.log(`✅ NUCLEAR PREPROCESSING - ${contentType} AFTER:`, {
      processedLength: processed.length,
      hasHTML: /<[^>]*>/g.test(processed),
      hasProse: /prose/.test(processed),
      preview: processed.substring(0, 200)
    });

    return processed;
  }

  // For other content types, return as-is (they're working fine)
  return content;
};

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

  // SIMPLIFIED: Direct mapping for enhancement types
  const getEnhancementTypeForRetry = (contentType: EnhancementContentType): string => {
    const mappings = {
      'summary': 'summarize',
      'keyPoints': 'extract-key-points', 
      'improved': 'improve-clarity',
      'markdown': 'convert-to-markdown',
      'original': 'original'
    };
    
    return mappings[contentType] || 'summarize';
  };

  const getContentForType = (type: EnhancementContentType): string => {
    let rawContent = '';
    
    switch (type) {
      case 'summary': 
        rawContent = note.summary || '';
        break;
      case 'keyPoints': 
        rawContent = note.key_points || '';
        break;
      case 'improved': 
        rawContent = note.improved_content || '';
        break;
      case 'markdown': 
        rawContent = note.markdown_content || '';
        break;
      case 'original': 
        rawContent = note.content || note.description || '';
        break;
      default: 
        rawContent = '';
    }

    // NUCLEAR: Apply preprocessing for problematic content types
    return preprocessContentForNuclearRendering(rawContent, type);
  };

  const getTitleForType = (type: EnhancementContentType): string => {
    const titles = {
      'summary': 'Summary',
      'keyPoints': 'Key Points',
      'improved': 'Improved Clarity',
      'markdown': 'Markdown',
      'original': 'Original Content'
    };
    
    return titles[type] || 'Content';
  };

  const enhancementType = getEnhancementTypeForRetry(contentType);
  const content = getContentForType(contentType);
  const title = getTitleForType(contentType);

  console.log("🎯 EnhancementDisplayPanel - NUCLEAR PREPROCESSING APPLIED:", {
    contentType,
    enhancementType,
    hasContent: !!content,
    contentLength: content.length,
    isLoading,
    isSummaryGenerating,
    preprocessingApplied: contentType === 'original' || contentType === 'improved'
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
      
      {/* Show content when not loading - ALL CONTENT TREATED AS MARKDOWN */}
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
