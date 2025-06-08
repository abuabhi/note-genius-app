
import React from "react";
import { RichTextEditor } from "@/components/ui/rich-text/RichTextEditor";
import { TagSelector } from "../../TagSelector";
import { Note } from "@/types/note";
import { Separator } from "@/components/ui/separator";

interface NoteStudyEditFormProps {
  note: Note;
  editableContent: string;
  selectedTags: { id?: string; name: string; color: string }[];
  availableTags: { id: string; name: string; color: string }[];
  isSaving: boolean;
  handleContentChange: (html: string) => void;
  handleSaveContent: () => void;
  toggleEditing: () => void;
  setSelectedTags: (tags: { id?: string; name: string; color: string }[]) => void;
}

export const NoteStudyEditForm: React.FC<NoteStudyEditFormProps> = ({
  note,
  editableContent,
  selectedTags,
  availableTags,
  handleContentChange,
  setSelectedTags
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Content</label>
          <RichTextEditor
            content={editableContent}
            onChange={handleContentChange}
          />
        </div>
        
        <Separator className="my-4" />
        
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
