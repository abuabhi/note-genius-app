
import { Camera, Pin } from "lucide-react";
import { Note } from "@/types/note";

interface NoteCardFloatingElementsProps {
  note: Note;
}

export const NoteCardFloatingElements = ({ note }: NoteCardFloatingElementsProps) => {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      {note.sourceType === 'scan' && (
        <div className="w-8 h-8 bg-blue-100/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
          <Camera className="h-4 w-4 text-blue-600" />
        </div>
      )}
      {note.pinned && (
        <div className="w-8 h-8 bg-mint-100/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
          <Pin size={14} className="fill-mint-600 text-mint-600" />
        </div>
      )}
    </div>
  );
};
