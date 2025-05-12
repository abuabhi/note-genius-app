
import React from "react";
import { Note } from "@/types/note";
import { NoteCardActions } from "./NoteCardActions";
import { NoteSummary } from "./NoteSummary";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface NoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, event: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const NoteCard = ({
  note,
  onNoteClick,
  onShowDetails,
  onPin,
  onDelete,
  isDeleting = false
}: NoteCardProps) => {
  const { subjects } = useUserSubjects();
  
  // Find the subject name based on subject_id or fall back to category
  const subjectName = note.subject_id 
    ? subjects.find(s => s.id === note.subject_id)?.name || note.category 
    : note.category;

  console.log(`NoteCard - Note: ${note.title}, Subject ID: ${note.subject_id}, Subject Name: ${subjectName}`);

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border p-4
        ${note.pinned ? "border-mint-200 bg-mint-50" : "border-gray-200 bg-white"}
        hover:shadow-md cursor-pointer transition-all
        ${isDeleting ? "opacity-50 pointer-events-none" : ""}
      `}
      onClick={() => onNoteClick(note)}
    >
      <div className="space-y-2">
        <div className="flex justify-between">
          <h3 className="font-medium text-lg">{note.title}</h3>
          <NoteCardActions
            noteId={note.id}
            noteTitle={note.title}
            noteContent={note.content || ""}
            isPinned={note.pinned || false}
            onPin={onPin}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {note.description}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex gap-2 items-center">
            <span>{note.date}</span>
            <span className="text-mint-600">{subjectName}</span>
            {note.archived && <span className="text-amber-600">Archived</span>}
          </div>
          <button
            onClick={(e) => onShowDetails(note, e)}
            className="text-mint-700 hover:text-mint-800 font-medium"
          >
            Details
          </button>
        </div>
      </div>

      {note.summary_status === "completed" && note.summary && (
        <NoteSummary summary={note.summary} />
      )}
    </div>
  );
};
