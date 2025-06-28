
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteStudyViewContent } from "./viewer/NoteStudyViewContent";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StudyViewHeader note={note} />
      <div className="container mx-auto px-4 py-6">
        <NoteStudyViewContent note={note} />
      </div>
    </div>
  );
};
