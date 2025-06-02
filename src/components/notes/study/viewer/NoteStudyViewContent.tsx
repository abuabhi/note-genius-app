import React, { useState, useEffect, useCallback } from 'react';
import { Note } from "@/types/note";
import { TwoColumnEnhancementView } from "../enhancements/TwoColumnEnhancementView";
import { NoteStudyEditForm } from "../editor/NoteStudyEditForm";
import { EnhancementUsageMeter } from "./EnhancementUsageMeter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface NoteStudyViewContentProps {
  note: Note;
  isEditing: boolean;
  fontSize: number;
  textAlign: string;
  editableContent: string;
  selectedTags: { id?: string; name: string; color: string }[];
  availableTags: { id: string; name: string; color: string }[];
  isSaving: boolean;
  statsLoading: boolean;
  currentUsage: number;
  monthlyLimit: number | null;
  handleContentChange: (content: string) => void;
  handleSaveContent: () => void;
  toggleEditing: () => void;
  handleEnhanceContent: () => Promise<void>;
  setSelectedTags: (tags: { id?: string; name: string; color: string }[]) => void;
  handleRetryEnhancement: (enhancementType: string) => Promise<void>;
  hasReachedLimit: boolean;
  fetchUsageStats: () => Promise<void>;
  onNoteUpdate: (updatedData: Partial<Note>) => Promise<void>;
  activeContentType: string;
  onActiveContentTypeChange: (type: string) => void;
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
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);

  // Function to handle scrolling and show/hide the floating buttons
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    // Adjust the scroll threshold as needed
    setShowFloatingButtons(scrollPosition > 100);
  }, []);

  useEffect(() => {
    // Add scroll event listener when the component mounts
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="flex flex-col">
      {/* Enhanced Usage meter positioned above tabs */}
      <div className="px-4 pt-4 pb-2 bg-gradient-to-r from-mint-50/30 to-white border-b border-mint-100/50">
        <EnhancementUsageMeter
          statsLoading={statsLoading}
          currentUsage={currentUsage}
          monthlyLimit={monthlyLimit}
        />
      </div>

      {isEditing ? (
        <NoteStudyEditForm
          note={note}
          editableContent={editableContent}
          selectedTags={selectedTags}
          availableTags={availableTags}
          onContentChange={handleContentChange}
          onSave={handleSaveContent}
          onCancel={toggleEditing}
          isSaving={isSaving}
          setSelectedTags={setSelectedTags}
          fontSize={fontSize}
          textAlign={textAlign}
        />
      ) : (
        <div className="relative flex-1">
          <TwoColumnEnhancementView
            note={note}
            fontSize={fontSize}
            textAlign={textAlign}
            activeContentType={activeContentType}
            setActiveContentType={onActiveContentTypeChange}
            onRetryEnhancement={handleRetryEnhancement}
            isEditOperation={isEditOperation}
          />
          
          {/* Floating action buttons for quick actions */}
          {showFloatingButtons && (
            <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-2">
              <Button
                variant="ghost"
                size="icon"
                className="shadow-md hover:bg-mint-50 text-mint-600 hover:text-mint-800"
                onClick={handleEnhanceContent}
                disabled={hasReachedLimit}
              >
                <Sparkles className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="shadow-md hover:bg-mint-50 text-mint-600 hover:text-mint-800"
                onClick={toggleEditing}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
