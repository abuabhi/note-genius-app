
import { CardTitle } from "@/components/ui/card";
import { Note } from "@/types/note";
import { NoteCardActions } from "../NoteCardActions";

interface NoteCardHeaderProps {
  note: Note;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
}

export const NoteCardHeader = ({ note, onPin, onDelete }: NoteCardHeaderProps) => {
  return (
    <>
      {/* Card actions positioned absolutely - now always visible */}
      <div className="absolute top-4 right-16">
        <NoteCardActions 
          noteId={note.id}
          noteTitle={note.title}
          noteContent={note.content || note.description || ""}
          isPinned={!!note.pinned} 
          onPin={onPin}
          onDelete={onDelete}
          iconSize={5}
        />
      </div>
      
      <CardTitle className="text-xl text-green-700 leading-relaxed pr-20 font-bold">
        {note.title}
      </CardTitle>
    </>
  );
};
