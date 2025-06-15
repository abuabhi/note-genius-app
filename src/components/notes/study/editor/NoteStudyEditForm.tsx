
import React from "react";
import { RichTextEditor } from "@/components/ui/rich-text/RichTextEditor";
import { TagSelector } from "../../TagSelector";
import { Note } from "@/types/note";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSubject } from "@/types/subject";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface NoteStudyEditFormProps {
  note: Note;
  editableContent: string;
  editableSubject: string;
  selectedTags: { id?: string; name: string; color: string }[];
  availableTags: { id: string; name: string; color: string }[];
  availableSubjects: UserSubject[];
  isSaving: boolean;
  handleContentChange: (html: string) => void;
  handleSaveContent: () => void;
  toggleEditing: () => void;
  setSelectedTags: (tags: { id?: string; name: string; color: string }[]) => void;
  onSubjectChange: (subject: string) => void;
}

export const NoteStudyEditForm: React.FC<NoteStudyEditFormProps> = ({
  note,
  editableContent,
  editableSubject,
  selectedTags,
  availableTags,
  handleContentChange,
  setSelectedTags,
  onSubjectChange
}) => {
  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();

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
          <label className="text-sm font-medium mb-1 block">Subject</label>
          <Select value={editableSubject} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjectsLoading ? (
                <SelectItem value="_loading" disabled>Loading subjects...</SelectItem>
              ) : userSubjects.length > 0 ? (
                userSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="_none" disabled>No subjects found</SelectItem>
              )}
            </SelectContent>
          </Select>
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
