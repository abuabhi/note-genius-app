
import { Note } from "@/types/note";
import { ViewMode } from "@/hooks/useViewPreferences";

interface NoteCardContentProps {
  note: Note;
  stripMarkdown: (text: string) => string;
  viewMode?: ViewMode;
}

export const NoteCardContent = ({ note, stripMarkdown, viewMode = 'grid' }: NoteCardContentProps) => {
  const plainTextContent = stripMarkdown(note.content || note.description || '');

  if (!plainTextContent) {
    return null;
  }

  const isListView = viewMode === 'list';

  // For list view, content is handled in the header
  if (isListView) {
    return null;
  }

  // Grid view - content as second line with beautiful styling
  return (
    <div className="mt-4">
      <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 font-light">
        {plainTextContent}
      </p>
    </div>
  );
};
