
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { Note } from "@/types/note";
import { TextAlignType } from "./hooks/useStudyViewState";
import { EnhancementType } from "@/hooks/noteEnrichment/types";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EnhancementTabsProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  isEditing: boolean;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => void;
}

export const EnhancementTabs = ({ 
  note, 
  fontSize, 
  textAlign,
  isEditing,
  isLoading = false,
  onRetryEnhancement
}: EnhancementTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("original");
  const [tabLoadingState, setTabLoadingState] = useState<Record<string, boolean>>({
    summary: false,
    keyPoints: false,
    markdown: false,
    improved: false
  });
  
  const originalContent = note.content || note.description || "";
  
  // Get each enhancement from its dedicated field
  const summaryContent = note.summary || "";
  const keyPointsContent = note.key_points || "";
  const markdownContent = note.markdown_content || "";
  const improvedContent = note.improved_content || "";
  
  // Check if these exist to determine which tabs to show
  const hasSummary = !!summaryContent && !!note.summary_generated_at;
  const hasKeyPoints = !!keyPointsContent && !!note.key_points_generated_at;
  const hasMarkdown = !!markdownContent && !!note.markdown_content_generated_at;
  const hasImprovedClarity = !!improvedContent && !!note.improved_content_generated_at;
  
  // Check enhancement statuses
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';
  
  // For debugging
  useEffect(() => {
    console.log("EnhancementTabs - Note data:", {
      noteId: note.id,
      hasSummary,
      hasKeyPoints,
      hasMarkdown,
      hasImprovedClarity,
      summary: summaryContent.slice(0, 50),
      keyPoints: keyPointsContent.slice(0, 50),
      markdown: markdownContent.slice(0, 50),
      improved: improvedContent.slice(0, 50),
      // Debug timestamps
      summaryTimestamp: note.summary_generated_at,
      keyPointsTimestamp: note.key_points_generated_at,
      markdownTimestamp: note.markdown_content_generated_at,
      improvedTimestamp: note.improved_content_generated_at,
      // Debug alignment
      textAlign: textAlign,
      contentHasAlignment: originalContent.includes('text-align'),
      // Debug status
      summaryStatus,
    });
  }, [
    note, hasSummary, hasKeyPoints, hasMarkdown, hasImprovedClarity, 
    textAlign, originalContent, summaryContent, keyPointsContent, 
    markdownContent, improvedContent, summaryStatus
  ]);
  
  // Reset to original tab when editing starts
  useEffect(() => {
    if (isEditing) {
      setActiveTab("original");
    }
  }, [isEditing]);

  // If editing, just show the original content
  if (isEditing) {
    return (
      <RichTextDisplay 
        content={originalContent} 
        fontSize={fontSize} 
        textAlign={textAlign}
      />
    );
  }
  
  // Handle retry for different enhancement types
  const handleRetry = (enhancementType: string) => {
    if (onRetryEnhancement) {
      // Start loading state for the specific tab
      setTabLoadingState(prev => ({ ...prev, [enhancementType]: true }));
      
      // Call retry function
      onRetryEnhancement(enhancementType);
      
      // We'll reset loading state when the component updates with new data
      setTimeout(() => {
        setTabLoadingState(prev => ({ ...prev, [enhancementType]: false }));
      }, 500); // Brief timeout to ensure UI updates properly
    }
  };
  
  // Format the enhancement display with proper styling, including loading and error states
  const renderEnhancementContent = (
    content: string, 
    title: string, 
    isMarkdown: boolean = false, 
    isLoading: boolean = false,
    hasError: boolean = false,
    enhancementType: string = ""
  ) => {
    if (isLoading || tabLoadingState[enhancementType]) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
          <p className="text-muted-foreground">Generating {title.toLowerCase()}...</p>
        </div>
      );
    }
    
    if (hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-red-700 font-medium">Enhancement failed</h3>
              <p className="text-sm text-red-600 mb-3">There was a problem generating this enhancement.</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRetry(enhancementType)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <RefreshCw className="mr-1 h-3 w-3" /> 
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    if (!content) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
          <p className="text-muted-foreground">No {title.toLowerCase()} available</p>
          {onRetryEnhancement && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleRetry(enhancementType)}
              className="mt-2"
            >
              <RefreshCw className="mr-1 h-3 w-3" /> Generate
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <div className="p-4 bg-mint-50/50 rounded-lg border border-mint-100">
        <h3 className="text-lg font-medium text-mint-800 mb-2">{title}</h3>
        <RichTextDisplay 
          content={content} 
          fontSize={fontSize} 
          textAlign={textAlign}
          className={`prose-sm prose-headings:font-medium prose-headings:text-mint-800 prose-ul:pl-6 prose-ol:pl-6 ${
            isMarkdown ? "font-mono" : ""
          }`}
        />
      </div>
    );
  };

  // Only show tabs if we have additional content
  const showTabs = hasSummary || hasKeyPoints || hasMarkdown || hasImprovedClarity || isGeneratingSummary;
  
  // If no enhancements to show, just display the content directly
  if (!showTabs) {
    return (
      <RichTextDisplay 
        content={originalContent} 
        fontSize={fontSize} 
        textAlign={textAlign}
      />
    );
  }

  return (
    <Tabs 
      defaultValue="original" 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="w-full"
    >
      <TabsList className="mb-4">
        <TabsTrigger value="original">Original</TabsTrigger>
        {(hasSummary || isGeneratingSummary || hasSummaryError) && (
          <TabsTrigger value="summary" className="relative">
            Summary
            {isGeneratingSummary && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-mint-500 animate-pulse"></span>
            )}
            {hasSummaryError && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </TabsTrigger>
        )}
        {hasKeyPoints && <TabsTrigger value="keyPoints">Key Points</TabsTrigger>}
        {hasMarkdown && <TabsTrigger value="markdown">Markdown</TabsTrigger>}
        {hasImprovedClarity && <TabsTrigger value="improved">Improved</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="original" className="mt-2">
        <RichTextDisplay 
          content={originalContent} 
          fontSize={fontSize} 
          textAlign={textAlign}
        />
      </TabsContent>
      
      {(hasSummary || isGeneratingSummary || hasSummaryError) && (
        <TabsContent value="summary" className="mt-2">
          {renderEnhancementContent(
            summaryContent, 
            "Summary", 
            false, 
            isGeneratingSummary || isLoading, 
            hasSummaryError,
            "summary"
          )}
        </TabsContent>
      )}
      
      {hasKeyPoints && (
        <TabsContent value="keyPoints" className="mt-2">
          {renderEnhancementContent(
            keyPointsContent, 
            "Key Points", 
            false, 
            isLoading, 
            false,
            "keyPoints"
          )}
        </TabsContent>
      )}

      {hasMarkdown && (
        <TabsContent value="markdown" className="mt-2">
          {renderEnhancementContent(
            markdownContent, 
            "Markdown Format", 
            true, 
            isLoading,
            false,
            "markdown"
          )}
        </TabsContent>
      )}

      {hasImprovedClarity && (
        <TabsContent value="improved" className="mt-2">
          {renderEnhancementContent(
            improvedContent, 
            "Improved Clarity", 
            false, 
            isLoading,
            false,
            "improved"
          )}
        </TabsContent>
      )}
    </Tabs>
  );
};
