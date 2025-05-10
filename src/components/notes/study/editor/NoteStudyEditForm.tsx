
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EnhanceNoteButton } from "../../enrichment/EnhanceNoteButton";
import { RichTextEditor } from "@/components/ui/rich-text/RichTextEditor";
import { TagSelector } from "../../TagSelector";
import { Note } from "@/types/note";

interface NoteStudyEditFormProps {
  note: Note;
  editableContent: string;
  selectedTags: { id?: string; name: string; color: string }[];
  availableTags: { id: string; name: string; color: string }[];
  isSaving: boolean;
  handleContentChange: (html: string) => void;
  handleSaveContent: () => void;
  toggleEditing: () => void;
  handleEnhanceContent: (enhancedContent: string) => void;
  setSelectedTags: (tags: { id?: string; name: string; color: string }[]) => void;
}

export const NoteStudyEditForm: React.FC<NoteStudyEditFormProps> = ({
  note,
  editableContent,
  selectedTags,
  availableTags,
  isSaving,
  handleContentChange,
  handleSaveContent,
  toggleEditing,
  handleEnhanceContent,
  setSelectedTags
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveContent} 
            disabled={isSaving}
            className="bg-mint-500 hover:bg-mint-600"
          >
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
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Content</label>
          <RichTextEditor
            content={editableContent}
            onChange={handleContentChange}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Tags</label>
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            availableTags={availableTags}
          />
        </div>
      </div>
    </div>
  );
};
