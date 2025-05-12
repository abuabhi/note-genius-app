
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { Note } from "@/types/note";
import { TextAlignType } from "./hooks/useStudyViewState";
import { EnhancementType } from "@/hooks/noteEnrichment/types";
import { Loader2 } from "lucide-react";

interface EnhancementTabsProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  isEditing: boolean;
}

export const EnhancementTabs = ({ 
  note, 
  fontSize, 
  textAlign,
  isEditing
}: EnhancementTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("original");
  const originalContent = note.content || note.description || "";
  
  // Get summary content from note if it exists
  const summaryContent = note.summary || "";
  const keyPointsContent = note.enhancements?.keyPoints || "";
  
  // Check if these exist to determine which tabs to show
  const hasSummary = !!summaryContent;
  const hasKeyPoints = !!keyPointsContent;
  const hasMarkdown = !!note.enhancements?.markdown;
  const hasImprovedClarity = !!note.enhancements?.improved;
  
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
  
  // Format the enhancement display with proper styling
  const renderEnhancementContent = (content: string, title: string) => {
    if (!content) return null;
    
    return (
      <div className="p-4 bg-mint-50/50 rounded-lg border border-mint-100">
        <h3 className="text-lg font-medium text-mint-800 mb-2">{title}</h3>
        <RichTextDisplay 
          content={content} 
          fontSize={fontSize} 
          textAlign={textAlign}
          className="prose-sm"
        />
      </div>
    );
  };

  // Only show tabs if we have additional content
  const showTabs = hasSummary || hasKeyPoints || hasMarkdown || hasImprovedClarity;
  
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
        {hasSummary && <TabsTrigger value="summary">Summary</TabsTrigger>}
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
      
      {hasSummary && (
        <TabsContent value="summary" className="mt-2">
          {renderEnhancementContent(summaryContent, "Summary")}
        </TabsContent>
      )}
      
      {hasKeyPoints && (
        <TabsContent value="keyPoints" className="mt-2">
          {renderEnhancementContent(keyPointsContent, "Key Points")}
        </TabsContent>
      )}

      {hasMarkdown && (
        <TabsContent value="markdown" className="mt-2">
          {renderEnhancementContent(note.enhancements?.markdown || "", "Markdown Format")}
        </TabsContent>
      )}

      {hasImprovedClarity && (
        <TabsContent value="improved" className="mt-2">
          {renderEnhancementContent(note.enhancements?.improved || "", "Improved Clarity")}
        </TabsContent>
      )}
    </Tabs>
  );
};
