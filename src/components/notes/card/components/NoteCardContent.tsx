
import { Note } from "@/types/note";

interface NoteCardContentProps {
  note: Note;
  stripMarkdown: (text: string) => string;
}

export const NoteCardContent = ({ note, stripMarkdown }: NoteCardContentProps) => {
  // Get plain text content without markdown formatting
  const plainTextContent = stripMarkdown(note.content || note.description || '');

  if (!plainTextContent) {
    return null;
  }

  return (
    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mt-3">
      {plainTextContent}
    </p>
  );
};
