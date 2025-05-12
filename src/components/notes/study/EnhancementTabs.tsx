
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { Note } from "@/types/note";
import { TextAlignType } from "./hooks/useStudyViewState";
import { EnhancementType } from "@/hooks/noteEnrichment/types";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EnhancementProcessing } from "../enrichment/EnhancementProcessing";
import { EnhancementError } from "../enrichment/EnhancementError";

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
      // Debug timestamps
      summaryTimestamp: note.summary_generated_at,
      keyPointsTimestamp: note.key_points_generated_at,
      markdownTimestamp: note.markdown_content_generated_at,
      improvedTimestamp: note.improved_content_generated_at,
      // Debug status
      summaryStatus,
      // Debug active tab
      activeTab
    });
  }, [note, hasSummary, hasKeyPoints, hasMarkdown, hasImprovedClarity, summaryStatus, activeTab]);
  
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
      return <EnhancementProcessing message={`Generating ${title.toLowerCase()}...`} enhancementType={enhancementType} />;
    }
    
    if (hasError) {
      return (
        <EnhancementError 
          error={`Failed to generate ${title.toLowerCase()}`}
          onRetry={() => handleRetry(enhancementType)}
          title={`${title} Generation Failed`}
          enhancementType={enhancementType}
        />
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
      <RichTextDisplay 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign}
        className={`prose-sm prose-headings:font-medium prose-headings:text-mint-800 prose-ul:pl-6 prose-ol:pl-6 ${
          isMarkdown ? "font-mono" : ""
        }`}
      />
    );
  };
  
  // Determine what tabs to show
  const availableTabs = ["original"];
  if (hasSummary || isGeneratingSummary || hasSummaryError) availableTabs.push("summary");
  if (hasKeyPoints) availableTabs.push("keyPoints");
  if (hasMarkdown) availableTabs.push("markdown");
  if (hasImprovedClarity) availableTabs.push("improved");
  
  // If only original content is available, just display it directly
  if (availableTabs.length === 1) {
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
      orientation="vertical"
      className="flex flex-row w-full border border-border rounded-lg overflow-hidden min-h-[300px]"
    >
      {/* Left side - Tab List */}
      <div className="flex-shrink-0 w-48 border-r border-border bg-muted/20">
        <TabsList className="flex-col w-full h-full bg-transparent rounded-none border-0 p-0 gap-0.5">
          <TabsTrigger 
            value="original" 
            className="w-full text-left py-3 px-4 rounded-none border-l-2 border-l-transparent data-[state=active]:border-l-mint-500 data-[state=active]:bg-mint-50"
          >
            Original
          </TabsTrigger>
          
          {(hasSummary || isGeneratingSummary || hasSummaryError) && (
            <TabsTrigger 
              value="summary" 
              className="w-full text-left py-3 px-4 rounded-none border-l-2 border-l-transparent data-[state=active]:border-l-mint-500 data-[state=active]:bg-mint-50 relative"
            >
              Summary
              {isGeneratingSummary && (
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-mint-500 animate-pulse"></span>
              )}
              {hasSummaryError && (
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </TabsTrigger>
          )}
          
          {hasKeyPoints && (
            <TabsTrigger 
              value="keyPoints" 
              className="w-full text-left py-3 px-4 rounded-none border-l-2 border-l-transparent data-[state=active]:border-l-mint-500 data-[state=active]:bg-mint-50"
            >
              Key Points
            </TabsTrigger>
          )}
          
          {hasMarkdown && (
            <TabsTrigger 
              value="markdown" 
              className="w-full text-left py-3 px-4 rounded-none border-l-2 border-l-transparent data-[state=active]:border-l-mint-500 data-[state=active]:bg-mint-50"
            >
              Markdown
            </TabsTrigger>
          )}
          
          {hasImprovedClarity && (
            <TabsTrigger 
              value="improved" 
              className="w-full text-left py-3 px-4 rounded-none border-l-2 border-l-transparent data-[state=active]:border-l-mint-500 data-[state=active]:bg-mint-50"
            >
              Improved Clarity
            </TabsTrigger>
          )}
        </TabsList>
      </div>
      
      {/* Right side - Content */}
      <div className="flex-grow p-4 overflow-y-auto">
        <TabsContent value="original" className="m-0 h-full">
          <div className="h-full">
            <h3 className="text-lg font-medium text-foreground mb-3">Original Note</h3>
            <RichTextDisplay 
              content={originalContent} 
              fontSize={fontSize} 
              textAlign={textAlign}
            />
          </div>
        </TabsContent>
        
        {(hasSummary || isGeneratingSummary || hasSummaryError) && (
          <TabsContent value="summary" className="m-0 h-full">
            <div className="h-full">
              <h3 className="text-lg font-medium text-mint-800 mb-3">Summary</h3>
              {renderEnhancementContent(
                summaryContent, 
                "Summary", 
                false, 
                isGeneratingSummary || isLoading, 
                hasSummaryError,
                "summary"
              )}
            </div>
          </TabsContent>
        )}
        
        {hasKeyPoints && (
          <TabsContent value="keyPoints" className="m-0 h-full">
            <div className="h-full">
              <h3 className="text-lg font-medium text-mint-800 mb-3">Key Points</h3>
              {renderEnhancementContent(
                keyPointsContent, 
                "Key Points", 
                false, 
                isLoading, 
                false,
                "keyPoints"
              )}
            </div>
          </TabsContent>
        )}
        
        {hasMarkdown && (
          <TabsContent value="markdown" className="m-0 h-full">
            <div className="h-full">
              <h3 className="text-lg font-medium text-mint-800 mb-3">Markdown Format</h3>
              {renderEnhancementContent(
                markdownContent, 
                "Markdown Format", 
                true, 
                isLoading,
                false,
                "markdown"
              )}
            </div>
          </TabsContent>
        )}
        
        {hasImprovedClarity && (
          <TabsContent value="improved" className="m-0 h-full">
            <div className="h-full">
              <h3 className="text-lg font-medium text-mint-800 mb-3">Improved Clarity</h3>
              {renderEnhancementContent(
                improvedContent, 
                "Improved Clarity", 
                false, 
                isLoading,
                false,
                "improved"
              )}
            </div>
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
};
