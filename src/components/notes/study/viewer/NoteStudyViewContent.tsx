
import React from 'react';
import { Note } from '@/types/note';
import { UserSubject } from '@/types/subject';
import { NoteStudyEditForm } from '../editor/NoteStudyEditForm';
import { NoteStudyDisplay } from './NoteStudyDisplay';

interface NoteStudyViewContentProps {
  note: Note;
  isEditing: boolean;
  fontSize: number;
  textAlign: string;
  editableContent: string;
  editableSubject: string;
  selectedTags: { id?: string; name: string; color: string }[];
  availableTags: { id: string; name: string; color: string }[];
  availableSubjects: UserSubject[];
  isSaving: boolean;
  statsLoading: boolean;
  currentUsage: number;
  monthlyLimit: number;
  handleContentChange: (html: string) => void;
  handleSaveContent: () => void;
  toggleEditing: () => void;
  handleEnhanceContent: (enhancementType: string) => void;
  setSelectedTags: (tags: { id?: string; name: string; color: string }[]) => void;
  handleRetryEnhancement: (enhancementType: string) => void;
  hasReachedLimit: boolean;
  fetchUsageStats: () => void;
  onNoteUpdate: (updatedData: Partial<Note>) => void;
  onSubjectChange: (subject: string) => void;
  activeContentType: string;
  onActiveContentTypeChange: (type: string) => void;
  isEditOperation: boolean;
}

export const NoteStudyViewContent: React.FC<NoteStudyViewContentProps> = ({
  note,
  isEditing,
  fontSize,
  textAlign,
  editableContent,
  editableSubject,
  selectedTags,
  availableTags,
  availableSubjects,
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
  onSubjectChange,
  activeContentType,
  onActiveContentTypeChange,
  isEditOperation
}) => {
  return (
    <div className="p-6">
      {isEditing ? (
        <NoteStudyEditForm
          note={note}
          editableContent={editableContent}
          editableSubject={editableSubject}
          selectedTags={selectedTags}
          availableTags={availableTags}
          availableSubjects={availableSubjects}
          isSaving={isSaving}
          handleContentChange={handleContentChange}
          handleSaveContent={handleSaveContent}
          toggleEditing={toggleEditing}
          setSelectedTags={setSelectedTags}
          onSubjectChange={onSubjectChange}
        />
      ) : (
        <NoteStudyDisplay
          note={note}
          fontSize={fontSize}
          textAlign={textAlign}
          statsLoading={statsLoading}
          currentUsage={currentUsage}
          monthlyLimit={monthlyLimit}
          handleEnhanceContent={handleEnhanceContent}
          handleRetryEnhancement={handleRetryEnhancement}
          hasReachedLimit={hasReachedLimit}
          fetchUsageStats={fetchUsageStats}
          onNoteUpdate={onNoteUpdate}
          activeContentType={activeContentType}
          onActiveContentTypeChange={onActiveContentTypeChange}
          isEditOperation={isEditOperation}
        />
      )}
    </div>
  );
};
