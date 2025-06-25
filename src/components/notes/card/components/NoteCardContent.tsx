
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

  if (isListView) {
    // Content preview for list view - single line
    return (
      <p className="text-xs text-gray-600 truncate">
        {plainTextContent}
      </p>
    );
  }

  // Grid view - content below title
  return (
    <div className="mt-3">
      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
        {plainTextContent}
      </p>
    </div>
  );
};
