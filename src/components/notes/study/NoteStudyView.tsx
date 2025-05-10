
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Note } from "@/types/note";
import { useStudyViewState, TextAlignType } from "./hooks/useStudyViewState";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteContentDisplay } from "./NoteContentDisplay";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { EnhanceNoteButton } from "../enrichment/EnhanceNoteButton";
import { toast } from "sonner";
import { updateNoteInDatabase } from "@/contexts/notes/operations";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView: React.FC<NoteStudyViewProps> = ({ note }) => {
  const {
    fontSize,
    textAlign,
    isFullWidth,
    isFullScreen,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    handleTextAlign,
    toggleWidth,
    toggleFullScreen
  } = useStudyViewState();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(note.content || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/notes/edit/${note.id}`);
  };
  
  const toggleEditing = () => {
    if (isEditing) {
      // Cancel editing, restore original content
      setEditableContent(note.content || '');
    } else {
      // Start editing
      setEditableContent(note.content || '');
    }
    setIsEditing(!isEditing);
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
  };
  
  const handleSaveContent = async () => {
    if (editableContent === note.content) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await updateNoteInDatabase(note.id, {
        content: editableContent
      });
      toast("Content updated successfully");
      // We need to update the note in our view
      note.content = editableContent;
      setIsEditing(false);
    } catch (error) {
      toast("Failed to save changes", {
        description: "Please try again"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEnhanceContent = (enhancedContent: string) => {
    if (isEditing) {
      setEditableContent(enhancedContent);
    } else {
      // Save directly
      updateNoteInDatabase(note.id, { content: enhancedContent })
        .then(() => {
          note.content = enhancedContent;
          toast("Content enhanced successfully");
        })
        .catch(() => {
          toast("Failed to save enhanced content");
        });
    }
  };

  return (
    <Card
      className={`bg-white text-gray-800 border-gray-200 ${
        isFullWidth ? "max-w-none" : "max-w-4xl mx-auto"
      } transition-all duration-300`}
    >
      <StudyViewHeader
        note={note}
        fontSize={fontSize}
        textAlign={textAlign}
        isFullWidth={isFullWidth}
        isFullScreen={isFullScreen}
        isEditing={isEditing}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
        onChangeTextAlign={handleTextAlign}
        onToggleWidth={toggleWidth}
        onToggleFullScreen={toggleFullScreen}
        onEdit={handleEdit}
        onToggleEditing={toggleEditing}
        onSave={handleSaveContent}
        isSaving={isSaving}
      />

      <CardContent className="p-6 text-gray-800">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveContent} 
                  disabled={isSaving}
                  className="bg-mint-500 hover:bg-mint-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={toggleEditing}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
              <EnhanceNoteButton
                noteId={note.id}
                noteTitle={note.title}
                noteContent={editableContent}
                onEnhance={handleEnhanceContent}
              />
            </div>
            <Textarea
              value={editableContent}
              onChange={handleContentChange}
              className="min-h-[500px] font-mono text-base border-mint-200 focus-visible:ring-mint-400"
              style={{ fontSize: `${fontSize}px` }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <EnhanceNoteButton
                noteId={note.id}
                noteTitle={note.title}
                noteContent={note.content || ''}
                onEnhance={handleEnhanceContent}
              />
            </div>
            <NoteContentDisplay
              content={note.content || ''}
              fontSize={fontSize}
              textAlign={textAlign as TextAlignType}
              showScannedImage={note.sourceType === 'scan' && !!note.scanData?.originalImageUrl}
              scannedImageUrl={note.scanData?.originalImageUrl}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
