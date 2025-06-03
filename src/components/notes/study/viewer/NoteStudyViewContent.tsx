
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { NoteContentDisplay } from "../NoteContentDisplay";
import { NoteStudyEditForm } from "../editor/NoteStudyEditForm";
import { EnhancementContentType } from "../enhancements/EnhancementSelector";
import { QuickConversionPanel } from "../conversion/QuickConversionPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface NoteStudyViewContentProps {
  note: Note;
  isEditing: boolean;
  fontSize: number;
  textAlign: TextAlignType;
  editableContent: string;
  selectedTags: { id?: string; name: string; color: string }[];
  availableTags: { id: string; name: string; color: string }[];
  isSaving: boolean;
  statsLoading: boolean;
  currentUsage: number;
  monthlyLimit: number;
  handleContentChange: (content: string) => void;
  handleSaveContent: () => Promise<void>;
  toggleEditing: () => void;
  handleEnhanceContent: (enhancementType: string) => Promise<void>;
  setSelectedTags: (tags: { id?: string; name: string; color: string }[]) => void;
  handleRetryEnhancement: (enhancementType: string) => Promise<void>;
  hasReachedLimit: boolean;
  fetchUsageStats: () => Promise<void>;
  onNoteUpdate: (updatedData: Partial<Note>) => Promise<void>;
  activeContentType: EnhancementContentType;
  onActiveContentTypeChange: (type: EnhancementContentType) => void;
  isEditOperation: boolean;
}

export const NoteStudyViewContent = ({
  note,
  isEditing,
  fontSize,
  textAlign,
  editableContent,
  selectedTags,
  availableTags,
  isSaving,
  statsLoading,
  currentUsage,
  monthlyLimit,
  handleContentChange,
  handleSaveContent,
  toggleEditing,
  handleEnhanceContent,
  setSelectedTags,
  handleRetryEnhancement,
  hasReachedLimit,
  fetchUsageStats,
  onNoteUpdate,
  activeContentType,
  onActiveContentTypeChange,
  isEditOperation
}: NoteStudyViewContentProps) => {
  const [selectedText, setSelectedText] = useState("");
  const [showConversionPanel, setShowConversionPanel] = useState(false);

  // Handle text selection for flashcard creation
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      setShowConversionPanel(true);
    } else {
      setSelectedText("");
      setShowConversionPanel(false);
    }
  };

  const handleTextSelectionConvert = async (frontText: string, backText: string) => {
    // This would integrate with the flashcard creation system
    console.log("Converting selection to flashcard:", { frontText, backText });
    // Implementation would go here
  };

  // Create a wrapper function for handleEnhanceContent with default enhancement type
  const handleEnhanceContentWrapper = async () => {
    await handleEnhanceContent('improve-clarity'); // Default enhancement type
  };

  if (isEditing) {
    return (
      <CardContent className="p-8">
        <NoteStudyEditForm
          note={note}
          editableContent={editableContent}
          selectedTags={selectedTags}
          availableTags={availableTags}
          isSaving={isSaving}
          handleContentChange={handleContentChange}
          handleSaveContent={handleSaveContent}
          toggleEditing={toggleEditing}
          handleEnhanceContent={handleEnhanceContentWrapper}
          setSelectedTags={setSelectedTags}
        />
      </CardContent>
    );
  }

  return (
    <CardContent className="p-0">
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
        {/* Main Content Panel */}
        <ResizablePanel defaultSize={showConversionPanel ? 75 : 100}>
          <div 
            className="p-8 h-full"
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
          >
            <NoteContentDisplay
              note={note}
              content={editableContent}
              fontSize={fontSize}
              textAlign={textAlign}
              isEditing={isEditing}
              onRetryEnhancement={handleRetryEnhancement}
              activeContentType={activeContentType}
              onActiveContentTypeChange={onActiveContentTypeChange}
            />
          </div>
        </ResizablePanel>

        {/* Conversion Panel */}
        {showConversionPanel && (
          <>
            <ResizableHandle className="w-2 bg-mint-100 hover:bg-mint-200 transition-colors" />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="p-4 h-full bg-gradient-to-br from-slate-50 to-mint-50/30">
                <QuickConversionPanel
                  note={note}
                  selectedText={selectedText}
                  onTextSelectionConvert={handleTextSelectionConvert}
                />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </CardContent>
  );
};
