
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { Note } from "@/types/note";
import { TextAlignType } from "./hooks/useStudyViewState";
import { EnhancementType } from "@/hooks/noteEnrichment/types";

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
  const hasKeyPoints = note.enhancements?.keyPoints || false;
  const keyPointsContent = note.enhancements?.keyPoints || "";
  
  // Reset to original tab when editing starts
  useEffect(() => {
    if (isEditing) {
      setActiveTab("original");
    }
  }, [isEditing]);

  // Only show tabs if we have additional content
  const showTabs = summaryContent || hasKeyPoints;
  
  // If no extra tabs to show, just display the content directly
  if (!showTabs || isEditing) {
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
        {summaryContent && <TabsTrigger value="summary">Summary</TabsTrigger>}
        {hasKeyPoints && <TabsTrigger value="keyPoints">Key Points</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="original" className="mt-2">
        <RichTextDisplay 
          content={originalContent} 
          fontSize={fontSize} 
          textAlign={textAlign}
        />
      </TabsContent>
      
      {summaryContent && (
        <TabsContent value="summary" className="mt-2">
          <div className="p-4 bg-mint-50/50 rounded-lg border border-mint-100">
            <h3 className="text-lg font-medium text-mint-800 mb-2">Summary</h3>
            <RichTextDisplay 
              content={summaryContent} 
              fontSize={fontSize} 
              textAlign={textAlign}
              className="prose-sm"
            />
          </div>
        </TabsContent>
      )}
      
      {hasKeyPoints && (
        <TabsContent value="keyPoints" className="mt-2">
          <div className="p-4 bg-mint-50/50 rounded-lg border border-mint-100">
            <h3 className="text-lg font-medium text-mint-800 mb-2">Key Points</h3>
            <RichTextDisplay 
              content={keyPointsContent} 
              fontSize={fontSize} 
              textAlign={textAlign}
              className="prose-sm"
            />
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
};
