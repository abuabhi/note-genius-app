
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

  // Grid view - show content preview
  return (
    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mt-3">
      {plainTextContent}
    </p>
  );
};
