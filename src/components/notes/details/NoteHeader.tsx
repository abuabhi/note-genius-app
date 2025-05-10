
import { Note } from "@/types/note";

interface NoteHeaderProps {
  note: Note;
}

export const NoteHeader = ({ note }: NoteHeaderProps) => {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-bold text-mint-800">{note.title}</h2>
      <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
        <span>{note.date}</span>
        <span className="text-mint-600">{note.category}</span>
      </div>
    </div>
  );
};
