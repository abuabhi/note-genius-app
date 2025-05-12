
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
    });
  }, [
    note, hasSummary, hasKeyPoints, hasMarkdown, hasImprovedClarity, 
    textAlign, originalContent, summaryContent, keyPointsContent, 
    markdownContent, improvedContent
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
  
  // Format the enhancement display with proper styling
  const renderEnhancementContent = (content: string, title: string, isMarkdown: boolean = false) => {
    if (!content) return null;
    
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
          {renderEnhancementContent(markdownContent, "Markdown Format", true)}
        </TabsContent>
      )}

      {hasImprovedClarity && (
        <TabsContent value="improved" className="mt-2">
          {renderEnhancementContent(improvedContent, "Improved Clarity")}
        </TabsContent>
      )}
    </Tabs>
  );
};
