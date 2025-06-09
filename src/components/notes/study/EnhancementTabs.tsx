
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { Note } from "@/types/note";
import { TextAlignType } from "./hooks/useStudyViewState";
import { EnhancementContent } from "./enhancements/EnhancementContent";
import { EnhancementTabHeader } from "./enhancements/EnhancementTabHeader";
import { TabStatusIndicator } from "./enhancements/TabStatusIndicator";

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
        removeTitle={true}
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
              <TabStatusIndicator 
                isGenerating={isGeneratingSummary} 
                hasError={hasSummaryError} 
              />
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
            <EnhancementTabHeader title="Original Note" />
            <div className="px-6 py-4">
              <RichTextDisplay 
                content={originalContent} 
                fontSize={fontSize} 
                textAlign={textAlign}
                removeTitle={true}
              />
            </div>
          </div>
        </TabsContent>
        
        {(hasSummary || isGeneratingSummary || hasSummaryError) && (
          <TabsContent value="summary" className="m-0 h-full">
            <div className="h-full">
              <EnhancementTabHeader title="Summary" />
              <EnhancementContent
                content={summaryContent}
                title="Summary"
                fontSize={fontSize}
                textAlign={textAlign}
                isMarkdown={true}
                isLoading={isGeneratingSummary || isLoading || tabLoadingState.summary}
                hasError={hasSummaryError}
                enhancementType="summary"
                onRetry={handleRetry}
              />
            </div>
          </TabsContent>
        )}
        
        {hasKeyPoints && (
          <TabsContent value="keyPoints" className="m-0 h-full">
            <div className="h-full">
              <EnhancementTabHeader title="Key Points" />
              <EnhancementContent
                content={keyPointsContent}
                title="Key Points"
                fontSize={fontSize}
                textAlign={textAlign}
                isMarkdown={true}
                isLoading={isLoading || tabLoadingState.keyPoints}
                enhancementType="keyPoints"
                onRetry={handleRetry}
              />
            </div>
          </TabsContent>
        )}
        
        {hasMarkdown && (
          <TabsContent value="markdown" className="m-0 h-full">
            <div className="h-full">
              <EnhancementTabHeader title="Markdown Format" />
              <EnhancementContent
                content={markdownContent}
                title="Markdown Format"
                fontSize={fontSize}
                textAlign={textAlign}
                isMarkdown={true}
                isLoading={isLoading || tabLoadingState.markdown}
                enhancementType="markdown"
                onRetry={handleRetry}
              />
            </div>
          </TabsContent>
        )}
        
        {hasImprovedClarity && (
          <TabsContent value="improved" className="m-0 h-full">
            <div className="h-full">
              <EnhancementTabHeader title="Improved Clarity" />
              <EnhancementContent
                content={improvedContent}
                title="Improved Clarity"
                fontSize={fontSize}
                textAlign={textAlign}
                isMarkdown={true}
                isLoading={isLoading || tabLoadingState.improved}
                enhancementType="improved"
                onRetry={handleRetry}
              />
            </div>
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
};
